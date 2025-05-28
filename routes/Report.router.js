const express = require('express');
const router = express.Router();

const User = require('../models/User.model');
const BuilderProfile = require('../models/Property/BuilderProfile.model');
const Project = require('../models/Property/Project.model');
const Building = require('../models/Property/Building.model');
const Floor = require('../models/Property/Floor.model');
const Unit = require('../models/Property/Unit.model');
const Transaction = require('../models/Transaction.model');


router.get('/summary', async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuilders,
      totalProjects,
      totalBuildings,
      totalFloors,
      totalUnits,
      totalTransactions,
      transactionAmountResult
    ] = await Promise.all([
      User.countDocuments(),
      BuilderProfile.countDocuments(),
      Project.countDocuments(),
      Building.countDocuments(),
      Floor.countDocuments(),
      Unit.countDocuments(),
      Transaction.countDocuments(),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const totalTransactionAmount = transactionAmountResult[0]?.totalAmount || 0;

    res.json({
      totalUsers,
      totalBuilders,
      totalProjects,
      totalBuildings,
      totalFloors,
      totalUnits,
      totalTransactions,
      totalTransactionAmount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report summary', error: err.message });
  }
});

module.exports = router;
