const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['healing', 'guidance', 'thanksgiving', 'protection', 'family', 'financial', 'spiritual', 'other'],
    default: 'other'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  city: String,
  country: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  prayerCount: {
    type: Number,
    default: 0
  },
  bibleVerses: [{
    reference: String,
    text: String,
    version: {
      type: String,
      default: 'NIV'
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'local', 'private'],
    default: 'public'
  },
  answered: {
    type: Boolean,
    default: false
  },
  answeredDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
prayerSchema.index({ location: '2dsphere' });
// Index for sorting by likes
prayerSchema.index({ likeCount: -1 });
// Index for recent prayers
prayerSchema.index({ createdAt: -1 });

// Update the updatedAt timestamp before saving
prayerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for calculating prayer age
prayerSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

module.exports = mongoose.model('Prayer', prayerSchema);