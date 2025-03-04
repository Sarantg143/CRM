const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const User = require("../models/User.model");
const authenticateUser = require("../middleware/authenticate");
const router = express.Router();
const admin = require("firebase-admin");

// Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

// 1
router.post('/', async (req, res) => {
  const { name, email, username, password } = req.body;
  try {
    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    const user = new User({ name, email, username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully as Buyer' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2
router.post("/login", async (req, res) => {
    const { emailOrUsername, password } = req.body;
    try {
      const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
      if (!user) return res.status(401).json({ message: "Invalid credentials." });
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials." });
  
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during login." });
    }
  });
  
  //3. Google Login
  router.post("/auth/google", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      const { email, name, uid } = decodedToken;
  
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({
          email,
          username: name || email.split("@")[0], 
          googleId: uid,
          role: "Buyer", 
        });
        await user.save();
      }
      const jwtToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } 
      );
  
      res.status(200).json({ message: "Google login successful", token: jwtToken, user });
    } catch (error) {
      res.status(500).json({ message: "Google login failed", error: error.message });
    }
  });
  
// 4
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send reset email
    await transporter.sendMail({
      from: `"CRM Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>
             <p>If you did not request this, ignore this email.</p>`,
    });

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ message: "Error processing forgot password request.", error: error.message });
  }
});

// 5
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params; 
  const { newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password.", error: error.message });
  }
});

// 6
router.get('/admin/view-users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 7
router.patch('/admin/promote/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;

  try {
    const requestingUser = req.user; 

    if (!["Admin", "SuperAdmin"].includes(requestingUser.role)) {
      return res.status(403).json({ message: "Unauthorized: Only Admins or SuperAdmins can change roles" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const validRoles = ["Buyer", "Seller", "Admin", "SuperAdmin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (requestingUser.role === "SuperAdmin") {
      targetUser.role = newRole;
    } else if (requestingUser.role === "Admin") {
      if (["Admin", "SuperAdmin"].includes(targetUser.role)) {
        return res.status(403).json({ message: "Admins cannot promote/demote other Admins or SuperAdmins" });
      }
      if (["Seller", "Admin","Buyer"].includes(newRole)) {
        targetUser.role = newRole;
      } else {
        return res.status(403).json({ message: "Admins can only promote to Seller , Buyer or Admin" });
      }
    }

    await targetUser.save();
    res.status(200).json({ message: `User promoted to ${newRole}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8
router.delete('/superadmin/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 9
router.get('/superadmin/counts', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ totalUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
