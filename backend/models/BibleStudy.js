const mongoose = require('mongoose');

const bibleStudySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prayer',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  theme: String,
  introduction: String,
  verses: [{
    reference: String,
    text: String,
    version: {
      type: String,
      default: 'NIV'
    },
    explanation: String,
    reflection: String
  }],
  questions: [{
    question: String,
    userAnswer: String,
    answeredAt: Date
  }],
  keyTakeaways: [String],
  prayerPoints: [String],
  additionalResources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'podcast']
    }
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  duration: {
    type: Number, // in minutes
    default: 15
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastAccessedAt on each access
bibleStudySchema.methods.updateAccess = function() {
  this.lastAccessedAt = Date.now();
  return this.save();
};

// Calculate and update progress
bibleStudySchema.methods.updateProgress = function() {
  const totalQuestions = this.questions.length;
  const answeredQuestions = this.questions.filter(q => q.userAnswer && q.userAnswer.trim() !== '').length;
  
  if (totalQuestions > 0) {
    this.progress = Math.round((answeredQuestions / totalQuestions) * 100);
    
    if (this.progress === 100 && !this.completed) {
      this.completed = true;
      this.completedAt = Date.now();
    }
  }
  
  return this.save();
};

module.exports = mongoose.model('BibleStudy', bibleStudySchema);