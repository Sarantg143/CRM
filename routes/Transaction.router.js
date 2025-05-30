const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction.model');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create new transaction
router.post('/', authenticate, async (req, res) => {
  try {
    const { builder, property, amount, paymentMethod, remarks } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const transaction = new Transaction({
      user: req.user._id,
      builder,
      property,
      amount,
      paymentMethod,
      remarks,
      status: 'pending'
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all transactions (Admin only)
router.get(
  '/',
  authenticate,
  authorizeRoles('admin', 'superAdmin','directBuilder'),
  async (req, res) => {
    try {
      const transactions = await Transaction.find()
        .populate('user', 'name email')
        .populate('builder', 'companyName')
        .populate('property', 'unitNumber');
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get logged-in user transactions (User or DirectBuilder)
router.get('/my', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('builder', 'companyName')
      .populate('property', 'unitNumber');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update transaction status (Admin only)
router.put('/:id/status', authenticate, authorizeRoles('admin', 'superAdmin','directBuilder'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
