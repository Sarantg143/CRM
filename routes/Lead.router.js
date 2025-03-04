const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead.model");
const Property = require("../models/Property.model");
const authenticateUser = require("../middleware/authenticate");
const User = require("../models/User.model");

//for role-based access
const authorizeRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
  }
  next();
};

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { property, seller, message, offerPrice } = req.body;

    // Ensure the authenticated user is a Buyer
    if (req.user.role !== "Buyer") {
      return res.status(403).json({ message: "Only buyers can send inquiries" });
    }

    // Check if property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Ensure seller exists
    const sellerExists = await User.findById(seller);
    if (!sellerExists || sellerExists.role !== "Seller") {
      return res.status(404).json({ message: "Invalid seller" });
    }

    const newLead = new Lead({
      property,
      buyer: req.user.userId, 
      seller,
      message,
      offerPrice,
    });

    await newLead.save();
    res.status(201).json({ message: "Inquiry sent successfully", lead: newLead });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


//  Get Leads for Seller (Requires Authentication)
// Get Leads for Seller
router.get("/seller", authenticateUser, authorizeRoles(["Seller", "SuperAdmin"]), async (req, res) => {
  try {
    const leads = await Lead.find({ seller: req.user.userId }) // FIXED: `req.user.userId`
      .populate("property", "title")
      .populate("buyer", "name email");

    if (leads.length === 0) {
      return res.status(404).json({ message: "No leads found for this seller" });
    }

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Leads for Buyer
router.get("/buyer", authenticateUser, authorizeRoles(["Buyer", "SuperAdmin"]), async (req, res) => {
  try {
    const leads = await Lead.find({ buyer: req.user.userId }) // FIXED: `req.user.userId`
      .populate("property", "title")
      .populate("seller", "name email");

    if (leads.length === 0) {
      return res.status(404).json({ message: "No leads found for this buyer" });
    }

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//  Update Lead Status (Only Seller or SuperAdmin)
router.put("/:id/status", authenticateUser, authorizeRoles(["Seller", "SuperAdmin"]), async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Ensure only the seller of the lead can update it
    if (req.user.role !== "SuperAdmin" && lead.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own leads" });
    }

    lead.status = status;
    await lead.save();

    res.status(200).json({ message: "Lead status updated", lead });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//  Delete a Lead (Only Buyer or SuperAdmin)
router.delete("/:id", authenticateUser, authorizeRoles(["Buyer", "SuperAdmin"]), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Ensure only the buyer of the lead can delete it
    if (req.user.role !== "SuperAdmin" && lead.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own inquiries" });
    }

    await lead.deleteOne();
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
