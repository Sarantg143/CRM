const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry.model");
const authenticateUser = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorizeRoles");

// Buyer can send an inquiry
router.post("/", authenticateUser, authorizeRoles(["Buyer"]), async (req, res) => {
  try {
    const { property, message } = req.body;
    
    if (!property || !message) {
      return res.status(400).json({ error: "Property and message are required." });
    }

    const inquiry = await Inquiry.create({
      buyer: req.user.userId,
      property,
      message
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Inquiries (SuperAdmin can view all inquiries)
router.get("/", authenticateUser, authorizeRoles(["SuperAdmin"]), async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("buyer", "name email")
      .populate("property", "title location");

    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Inquiries for a Buyer (Buyer can view their own inquiries)
router.get("/buyer", authenticateUser, authorizeRoles(["Buyer"]), async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user.userId })
      .populate("property", "title location");

    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Inquiries for a Seller (Seller can view inquiries about their properties)
router.get("/seller", authenticateUser, authorizeRoles(["Seller", "SuperAdmin"]), async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate({
        path: "property",
        match: { seller: req.user.userId }, // Only properties belonging to this seller
        select: "title location"
      })
      .populate("buyer", "name email");

    // Remove empty inquiries where property doesn't match
    const filteredInquiries = inquiries.filter(inquiry => inquiry.property !== null);

    res.status(200).json(filteredInquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Inquiry Status (Seller or Admin can mark it as resolved)
router.put("/:id", authenticateUser, authorizeRoles(["Seller", "SuperAdmin"]), async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    inquiry.status = req.body.status || inquiry.status;
    await inquiry.save();

    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Delete Inquiry (SuperAdmin only)
router.delete("/:id", authenticateUser, authorizeRoles(["SuperAdmin"]), async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
