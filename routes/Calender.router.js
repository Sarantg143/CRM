const express = require('express');
const Event = require('../models/Calender.model');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create new event
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, startDate, endDate, isPublic, link } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, startDate and endDate are required' });
    }
    
    const event = new Event({
      userId: req.user._id,
      title,
      startDate,
      endDate,
      isPublic: isPublic || false,
      link,
    });

    await event.save();
    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
});

// Get all events for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
});

// Get event by id (only if owned by user)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event', error: err.message });
  }
});

// Update event by id (only if owned by user)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });
    res.json({ message: 'Event updated', event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event', error: err.message });
  }
});

// Delete event by id (only if owned by user)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
});

module.exports = router;
