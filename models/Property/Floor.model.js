const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  floorNumber: Number,
  totalUnits: Number
});

module.exports = mongoose.model('Floor', floorSchema);