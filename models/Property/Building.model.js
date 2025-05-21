const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  buildingName: { type: String, required: true },
  floorsCount: Number,
  amenities: [String],
  photos: [String],
  videos: [String],
  description: String,

}, { timestamps: true });

module.exports = mongoose.model('Building', buildingSchema);