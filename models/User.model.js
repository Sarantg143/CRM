const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  role: {
    type: String,
    enum: ['user', 'directBuilder', 'admin', 'superAdmin','broker'],
    default: 'user'
  },
  profilepic:  { type: String},
  profilebanner: { type: String},
  phone: { type: String},
  companyName:{ type: String},

  isActive:{ type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  token:       { type: String },
  socialId:    {type: String,required: [false, 'Social media ID required'],unique: true,sparse: true  },
  googleId: { type: String },
  resetPasswordToken: {type:String},
  resetPasswordExpiry: {type:Date}},{ timestamps: true });


  userSchema.pre('save', function (next) {
  if (this.role === 'directBuilder' && !this.companyName) {
    next(new Error('DirectBuilder must have companyName'));
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
