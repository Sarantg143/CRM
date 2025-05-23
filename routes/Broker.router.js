
const express = require('express');
const router = express.Router();
const Broker = require('../models/Broker.model');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create broker profile
router.post('/', authenticate, authorizeRoles('broker', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const exists = await Broker.findOne({ user: req.user._id });
    if (exists) {
      return res.status(400).json({ message: 'Broker profile already exists.' });
    }

    const broker = new Broker({
      ...req.body,
      user: req.user._id
    });

    await broker.save();
    res.status(201).json(broker);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all brokers with property count
router.get('/all', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    const brokers = await Broker.find()
      .populate('user', 'username email')
      .populate('properties', 'unitNumber floorNumber status');

    res.json(brokers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch brokers', error: err.message });
  }
});

// Get own broker profile
router.get('/me', authenticate, authorizeRoles('broker', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id })
      .populate('user', 'username email')
      .populate('properties', 'unitNumber floorNumber status');

    if (!broker) return res.status(404).json({ message: 'Broker profile not found' });
    res.json(broker);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch broker profile', error: err.message });
  }
});

// Assign properties to a broker
router.put('/:id/assign-properties', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    const { properties } = req.body;

    const broker = await Broker.findById(req.params.id);
    if (!broker) return res.status(404).json({ message: 'Broker not found' });

    broker.properties = properties; // overwrite or push as needed
    broker.activeListings = properties.length;
    await broker.save();

    res.json(broker);
  } catch (err) {
    res.status(400).json({ message: 'Assignment failed', error: err.message });
  }
});

router.get('/by-property/:unitId', authenticate, async (req, res) => {
  try {
    const { unitId } = req.params;

    const brokers = await Broker.find({ properties: unitId })
      .populate('user', 'username email')
      .populate('properties', 'unitNumber floorNumber status');

    if (!brokers || brokers.length === 0) {
      return res.status(404).json({ message: 'No brokers assigned to this property' });
    }

    res.json(brokers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brokers by property', error: error.message });
  }
});

module.exports = router;