
const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');

const BuilderProfile = require('../models/Property/BuilderProfile.model');
const Project = require('../models/Property/Project.model');
const Building = require('../models/Property/Building.model');
const Floor = require('../models/Property/Floor.model');
const Unit = require('../models/Property/Unit.model');

// --- Builder Profile ---
router.post('/builder-profile', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const profile = new BuilderProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/builder-profile/:id', async (req, res) => {
  try {
    const profile = await BuilderProfile.findById(req.params.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: 'Builder profile not found' });
  }
});

router.put('/builder-profile/:id', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const profile = await BuilderProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/builder-profile/:id', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    await BuilderProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Builder profile deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Project ---
router.post('/project', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/projects/by-builder/:builderId', async (req, res) => {
  try {
    const projects = await Project.find({ builder: req.params.builderId });
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/project/:id', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/project/:id', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Building ---
router.post('/building', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const building = new Building(req.body);
    await building.save();
    res.status(201).json(building);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/buildings/by-project/:projectId', async (req, res) => {
  try {
    const buildings = await Building.find({ project: req.params.projectId });
    res.json(buildings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/building/:id', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(building);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/building/:id', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    await Building.findByIdAndDelete(req.params.id);
    res.json({ message: 'Building deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Floor ---
router.post('/floor', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const floor = new Floor(req.body);
    await floor.save();
    res.status(201).json(floor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/floors/by-building/:buildingId', async (req, res) => {
  try {
    const floors = await Floor.find({ building: req.params.buildingId });
    res.json(floors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/floor/:id', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(floor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/floor/:id', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    await Floor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Floor deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Unit ---
router.post('/unit', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const unit = new Unit(req.body);
    await unit.save();
    res.status(201).json(unit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/units/by-floor/:floorId', async (req, res) => {
  try {
    const units = await Unit.find({ floor: req.params.floorId });
    res.json(units);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/unit/:id', authenticate, authorizeRoles('directBuilder', 'admin', 'superAdmin'), async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/unit/:id', authenticate, authorizeRoles('admin', 'superAdmin'), async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
