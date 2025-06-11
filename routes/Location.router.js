const express = require('express');
const ip = require('indian_places');
const router = express.Router();

router.get('/', (req, res) => {
  const states = ip.getStates();
  res.json(states.map(s => ({ name: s.name })));
});

router.get('/:stateName', (req, res) => {
  const { stateName } = req.params;
  const state = ip.getStates().find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) return res.status(404).json({ error: 'State not found' });
  const districts = state.getDistricts(); 
  res.json(districts.map(d => ({ name: d.name })));
});

router.get('/:stateName/:districtName', (req, res) => {
  const { stateName, districtName } = req.params;
  const state = ip.getStates().find(s => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) return res.status(404).json({ error: 'State not found' });

  const district = state.getDistricts()
    .find(d => d.name.toLowerCase() === districtName.toLowerCase());
  if (!district) return res.status(404).json({ error: 'District not found' });

  const places = district.getPlaces(); 
  res.json(places);
});

module.exports = router;
