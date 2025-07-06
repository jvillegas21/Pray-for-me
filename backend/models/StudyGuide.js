const mongoose = require('mongoose');

const studyGuideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  prayerRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prayer',
    required: true,
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
  estimatedDuration: {
    type: Number, // in minutes
    default: 15,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  sections: [{
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    verses: [{
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
    }],
    questions: [{
      question: {
        type: String,
        required: true,
        maxlength: 500,
      },
      type: {
        type: String,
        enum: ['reflection', 'application', 'interpretation', 'personal'],
        default: 'reflection',
      },
      hints: [{
        type: String,
        maxlength: 200,
      }],
    }],
    order: {
      type: Number,
      required: true,
    },
  }],
  keyVerses: [{
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
    explanation: {
      type: String,
      maxlength: 500,
    },
  }],
  prayerPrompts: [{
    prompt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    category: {
      type: String,
      enum: ['praise', 'thanksgiving', 'confession', 'petition', 'intercession'],
      required: true,
    },
  }],
  reflectionQuestions: [{
    question: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['personal', 'practical', 'spiritual', 'relational'],
      required: true,
    },
  }],
  actionSteps: [{
    step: {
      type: String,
      required: true,
      maxlength: 300,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    order: {
      type: Number,
      required: true,
    },
  }],
  createdBy: {
    type: String,
    enum: ['ai', 'human', 'template'],
    default: 'ai',
  },
  aiPrompt: {
    type: String,
    maxlength: 1000,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      review: {
        type: String,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  completions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    answers: [{
      questionId: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        maxlength: 1000,
      },
      reflections: {
        type: String,
        maxlength: 1000,
      },
    }],
  }],
}, {
  timestamps: true,
});

// Create indexes for efficient queries
studyGuideSchema.index({ prayerRequest: 1 });
studyGuideSchema.index({ category: 1, isActive: 1 });
studyGuideSchema.index({ difficulty: 1, isActive: 1 });
studyGuideSchema.index({ 'rating.average': -1, usageCount: -1 });
studyGuideSchema.index({ createdAt: -1 });

// Text search index
studyGuideSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Update rating average when new rating is added
studyGuideSchema.pre('save', function(next) {
  if (this.isModified('rating.ratings')) {
    const ratings = this.rating.ratings;
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      this.rating.average = sum / ratings.length;
      this.rating.count = ratings.length;
    }
  }
  next();
});

// Instance method to add a rating
studyGuideSchema.methods.addRating = function(userId, rating, review) {
  // Remove existing rating from same user
  this.rating.ratings = this.rating.ratings.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  // Add new rating
  this.rating.ratings.push({
    user: userId,
    rating: rating,
    review: review,
  });
  
  return this.save();
};

// Instance method to start a study session
studyGuideSchema.methods.startStudy = function(userId) {
  // Remove existing incomplete session
  this.completions = this.completions.filter(
    c => c.user.toString() !== userId.toString() || c.completedAt
  );
  
  // Add new session
  this.completions.push({
    user: userId,
    startedAt: new Date(),
    progress: 0,
  });
  
  return this.save();
};

// Instance method to update progress
studyGuideSchema.methods.updateProgress = function(userId, progress, notes) {
  const completion = this.completions.find(
    c => c.user.toString() === userId.toString() && !c.completedAt
  );
  
  if (completion) {
    completion.progress = progress;
    if (notes) {
      completion.notes = notes;
    }
    if (progress >= 100) {
      completion.completedAt = new Date();
      this.usageCount += 1;
    }
  }
  
  return this.save();
};

// Instance method to save answer
studyGuideSchema.methods.saveAnswer = function(userId, questionId, answer, reflections) {
  const completion = this.completions.find(
    c => c.user.toString() === userId.toString() && !c.completedAt
  );
  
  if (completion) {
    // Remove existing answer for this question
    completion.answers = completion.answers.filter(
      a => a.questionId !== questionId
    );
    
    // Add new answer
    completion.answers.push({
      questionId: questionId,
      answer: answer,
      reflections: reflections,
    });
  }
  
  return this.save();
};

// Static method to find recommended studies
studyGuideSchema.statics.findRecommendedStudies = function(category, difficulty, limit = 5) {
  const query = {
    isActive: true,
    isPublic: true,
  };
  
  if (category) {
    query.category = category;
  }
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  return this.find(query)
    .sort({ 'rating.average': -1, usageCount: -1 })
    .limit(limit);
};

// Static method to find studies by user completion
studyGuideSchema.statics.findStudiesByUser = function(userId, completed = false) {
  const matchStage = completed 
    ? { 'completions.user': userId, 'completions.completedAt': { $exists: true } }
    : { 'completions.user': userId, 'completions.completedAt': { $exists: false } };
  
  return this.find(matchStage)
    .populate('prayerRequest', 'title category')
    .sort({ 'completions.startedAt': -1 });
};

module.exports = mongoose.model('StudyGuide', studyGuideSchema);