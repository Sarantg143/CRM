const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead.model');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create a new lead (accessible by anyone authenticated - user, directBuilder, admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const leadData = req.body;
    if (req.user.role === 'user') {
      leadData.createdBy = req.user._id; 
    }
    const newLead = new Lead(leadData);
    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all leads - Admin only (can filter or paginate later)
router.get('/', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('assignedTo', 'name email role')
      .populate('interestedIn.builder', 'companyName')
      .populate('interestedIn.project', 'projectName')
      .populate('interestedIn.unit', 'unitNumber');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leads assigned to logged in directBuilder
router.get('/assigned', authenticate, authorizeRoles('directBuilder'), async (req, res) => {
  try {
    const leads = await Lead.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('interestedIn.builder', 'companyName')
      .populate('interestedIn.project', 'projectName')
      .populate('interestedIn.unit', 'unitNumber');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leads created by logged-in user
router.get('/my-leads', authenticate, authorizeRoles('user'), async (req, res) => {
  try {
    const leads = await Lead.find({ createdBy: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('interestedIn.builder', 'companyName')
      .populate('interestedIn.project', 'projectName')
      .populate('interestedIn.unit', 'unitNumber');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead status, notes, assign lead - Admin and directBuilder can update their leads
router.put('/:id', authenticate, authorizeRoles('admin', 'superAdmin', 'directBuilder'), async (req, res) => {
  try {
    const leadId = req.params.id;
    const updateData = req.body;

    // If directBuilder, verify they own the lead
    if (req.user.role === 'directBuilder') {
      const lead = await Lead.findById(leadId);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      if (lead.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this lead' });
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(leadId, updateData, { new: true });
    if (!updatedLead) return res.status(404).json({ error: 'Lead not found' });
    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete lead - Admin only
router.delete('/:id', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    const leadId = req.params.id;
    const deletedLead = await Lead.findByIdAndDelete(leadId);
    if (!deletedLead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
