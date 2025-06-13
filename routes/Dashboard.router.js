const express = require('express');
const router = express.Router();
const Project = require('../models/Property/Project.model');
const Transaction = require('../models/Transaction.model');
const Lead = require('../models/Lead.model');
const User = require('../models/User.model');

// Admin Dashboard
router.get('/admin', async (req, res) => {
  try {
    const totalProperties = await Project.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalAmount = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalLeads = await Lead.countDocuments();

    res.json({
      totalProperties,
      totalTransactions,
      totalAmount: totalAmount[0]?.total || 0,
      totalLeads
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Builder Dashboard
router.get('/:builderId', async (req, res) => {
  try {
    const builderId = req.params.builderId;

    const builderProperties = await Project.countDocuments({ builder: builderId });

    const builderTransactions = await Transaction.countDocuments({ builder: builderId });

    const builderAmount = await Transaction.aggregate([
      { $match: { builder: builderId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      builderProperties,
      builderTransactions,
      builderAmount: builderAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
