
const mongoose = require('mongoose');


const projectMediaSchema = new mongoose.Schema({
  url:   { type: String, required: true },
  type:  { type: String,  required: true },
  title: { type: String }
});


const projectSchema = new mongoose.Schema({
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'BuilderProfile', required: true },
  projectName: { type: String, required: true },
  location: {
    city: String,
    area: String,
    pincode: String
  },
  propertyType: {
    type: String,
    enum: ['Plot', 'Apartment', 'Villa', 'Commercial'],
    required: true
  },
  possessionDate: Date,
  description: String,
  amenities: [String],
  specifications: String,
  media: {
    photos: [ projectMediaSchema ],
    videos:  [ projectMediaSchema ],
    threeDVideo:  [ projectMediaSchema ]
  },
 
  followedCount: { type: Number, default: 0 },
 createdAt:        { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);