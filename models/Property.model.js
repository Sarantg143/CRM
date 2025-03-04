const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
   
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
   
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  area: {
    type: Number,
    required: [true, 'Please add the area'],
    min: [0, 'Area cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  type: {
    type: String,
    enum: ['land', 'plot', 'commercial', 'residential','villa'], 
    default: 'land'
  },
  images: [{
    type: String,
    required: [true, 'Please upload at least one image']
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  coordinates: {

    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  }
});

PropertySchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Property', PropertySchema);
