const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction.model");
const authenticateUser = require("../middleware/authenticate");
const authorizeRoles = require("../middleware/authorizeRoles");

// 1
router.post("/", authenticateUser, authorizeRoles(["Buyer"]), async (req, res) => {
  try {
    const { seller, property, amount, paymentMethod, transactionId } = req.body;

    if (!seller || !property || !amount || !paymentMethod || !transactionId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = new Transaction({
      buyer: req.user.userId,
      seller,
      property,
      amount,
      paymentMethod,
      transactionId
    });

    await transaction.save();
    res.status(201).json({ message: "Transaction created successfully", transaction });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  2
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("property", "title price");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    //  only buyer, seller, or SuperAdmin can view the transaction
    if (req.user.userId !== transaction.buyer.toString() &&
        req.user.userId !== transaction.seller.toString() &&
        req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions for a Buyer
router.get("/buyer", authenticateUser, authorizeRoles(["Buyer", "SuperAdmin"]), async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user.userId })
      .populate("seller", "name email")
      .populate("property", "title price");

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions for a Seller
router.get("/seller", authenticateUser, authorizeRoles(["Seller", "SuperAdmin"]), async (req, res) => {
  try {
    const transactions = await Transaction.find({ seller: req.user.userId })
      .populate("buyer", "name email")
      .populate("property", "title price");

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Transaction Status (SuperAdmin only)
router.put("/:id/status", authenticateUser, authorizeRoles(["SuperAdmin"]), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "completed", "failed", "refunded"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction status updated", transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Transaction (SuperAdmin only)
router.delete("/:id", authenticateUser, authorizeRoles(["SuperAdmin"]), async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
