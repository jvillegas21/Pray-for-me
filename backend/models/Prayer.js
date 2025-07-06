const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: [
      'healing',
      'family',
      'work',
      'relationships',
      'financial',
      'spiritual',
      'guidance',
      'thanksgiving',
      'forgiveness',
      'protection',
      'strength',
      'peace',
      'other'
    ],
    required: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public',
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    // Track anonymous views for non-logged users
    sessionId: {
      type: String,
    },
  }],
  viewsCount: {
    type: Number,
    default: 0,
  },
  prayedFor: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    prayedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  prayedForCount: {
    type: Number,
    default: 0,
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      likedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  bibleVerses: [{
    verse: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    translation: {
      type: String,
      default: 'NIV',
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  }],
  studyGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGuide',
  },
  answered: {
    type: Boolean,
    default: false,
  },
  answeredAt: {
    type: Date,
  },
  answerDescription: {
    type: String,
    maxlength: 1000,
  },
  updates: [{
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'harassment', 'other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  }],
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved',
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    },
  },
}, {
  timestamps: true,
});

// Create geospatial index for location-based queries
prayerSchema.index({ location: '2dsphere' });

// Create text index for search functionality
prayerSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});

// Create compound indexes for efficient queries
prayerSchema.index({ author: 1, createdAt: -1 });
prayerSchema.index({ category: 1, createdAt: -1 });
prayerSchema.index({ urgency: 1, createdAt: -1 });
prayerSchema.index({ viewsCount: -1, createdAt: -1 });
prayerSchema.index({ prayedForCount: -1, createdAt: -1 });
prayerSchema.index({ visibility: 1, isActive: 1, createdAt: -1 });

// TTL index for automatic deletion of expired prayers
prayerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update counts when arrays are modified
prayerSchema.pre('save', function(next) {
  if (this.isModified('views')) {
    this.viewsCount = this.views.length;
  }
  if (this.isModified('prayedFor')) {
    this.prayedForCount = this.prayedFor.length;
  }
  next();
});

// Instance method to check if user has viewed the prayer
prayerSchema.methods.hasUserViewed = function(userId, sessionId) {
  if (userId) {
    return this.views.some(view => view.user && view.user.toString() === userId.toString());
  }
  if (sessionId) {
    return this.views.some(view => view.sessionId === sessionId);
  }
  return false;
};

// Instance method to check if user has prayed for this prayer
prayerSchema.methods.isPrayedForByUser = function(userId) {
  return this.prayedFor.some(prayer => prayer.user.toString() === userId.toString());
};

// Instance method to add a view (for ranking algorithm)
prayerSchema.methods.addView = function(userId, sessionId) {
  // Don't add duplicate views from same user/session
  if (!this.hasUserViewed(userId, sessionId)) {
    const viewData = { viewedAt: new Date() };
    if (userId) {
      viewData.user = userId;
    }
    if (sessionId) {
      viewData.sessionId = sessionId;
    }
    this.views.push(viewData);
    this.viewsCount = this.views.length;
  }
  return this.save();
};

// Instance method to add a prayer record
prayerSchema.methods.addPrayerRecord = function(userId) {
  if (!this.isPrayedForByUser(userId)) {
    this.prayedFor.push({ user: userId });
    this.prayedForCount = this.prayedFor.length;
  }
  return this.save();
};

// Instance method to add a comment
prayerSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content,
  });
  return this.save();
};

// Instance method to mark as answered
prayerSchema.methods.markAsAnswered = function(description) {
  this.answered = true;
  this.answeredAt = new Date();
  if (description) {
    this.answerDescription = description;
  }
  return this.save();
};

// Static method to find prayers near location
prayerSchema.statics.findPrayersNearLocation = function(longitude, latitude, radiusInKm = 10, options = {}) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert to meters
      }
    },
    isActive: true,
    visibility: { $in: ['public'] }
  };

  if (options.category) {
    query.category = options.category;
  }

  if (options.urgency) {
    query.urgency = options.urgency;
  }

  if (options.answered !== undefined) {
    query.answered = options.answered;
  }

  return this.find(query)
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to find trending prayers (view-based ranking)
prayerSchema.statics.findTrendingPrayers = function(options = {}) {
  const query = {
    isActive: true,
    visibility: 'public',
    createdAt: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    }
  };

  return this.find(query)
    .populate('author', 'username firstName lastName profilePicture')
    .sort({ viewsCount: -1, prayedForCount: -1, createdAt: -1 })
    .limit(options.limit || 20);
};

module.exports = mongoose.model('Prayer', prayerSchema);