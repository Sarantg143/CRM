const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  buildingName: { type: String, required: true },
  floorsCount: Number,
  amenities: [String],
  photos: [String],
  videos: [String],
  description: String,
  mapViewUrl: {type: String},

  buildingArea: { type: String },                
  priceRange: { type: String },                  
  units: { type: Number },                       
  type: { type: String },  // "Residential", "Commercial"

}, { timestamps: true });

module.exports = mongoose.model('Building', buildingSchema);