const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  console.log("Headers received:", req.headers);

  const token = req.headers.authorization; // Directly take the token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded User:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateUser;
