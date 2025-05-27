const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Lead = require('../models/Lead.model');
const BuilderProfile = require('../models/Property/BuilderProfile.model');
const Project = require('../models/Property/Project.model');
const Unit = require('../models/Property/Unit.model');
const User = require('../models/User.model');

const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create a new lead (accessible by anyone authenticated - user, directBuilder, admin)
router.post('/', authenticate, async (req, res) => {
  try {
    const leadData = req.body;

    async function checkExists(id, model) {
      if (!id) return true; 
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const exists = await model.exists({ _id: id });
      return !!exists;
    }

    const builderExists = await checkExists(leadData.interestedIn?.builder, BuilderProfile);
    if (!builderExists) return res.status(400).json({ error: 'Builder ID is invalid or does not exist' });

    const projectExists = await checkExists(leadData.interestedIn?.project, Project);
    if (!projectExists) return res.status(400).json({ error: 'Project ID is invalid or does not exist' });

    const unitExists = await checkExists(leadData.interestedIn?.unit, Unit);
    if (!unitExists) return res.status(400).json({ error: 'Unit ID is invalid or does not exist' });

    const assignedToExists = await checkExists(leadData.assignedTo, User);
    if (!assignedToExists) return res.status(400).json({ error: 'AssignedTo User ID is invalid or does not exist' });

    if (leadData.notes && leadData.notes.length) {
      for (const note of leadData.notes) {
        const addedByExists = await checkExists(note.addedBy, User);
        if (!addedByExists) {
          return res.status(400).json({ error: `Note addedBy User ID (${note.addedBy}) is invalid or does not exist` });
        }
      }
    }
    leadData.createdBy = req.user._id;
    const createdByExists = await checkExists(leadData.createdBy, User);
    if (!createdByExists) return res.status(400).json({ error: 'CreatedBy User ID is invalid or does not exist' });

    const newLead = new Lead(leadData);
    await newLead.save();

    res.status(201).json(newLead);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all leads - Admin only (can filter or paginate later)
router.get('/', authenticate,  async (req, res) => {
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
router.get('/assigned', authenticate,async (req, res) => {
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
router.get('/my-leads', authenticate,  async (req, res) => {
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
