const mongoose = require('mongoose');

const calendarNoteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true, // Format: YYYY-MM-DD
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mentorship', 'event', 'opportunity']
  },
  noteText: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
calendarNoteSchema.index({ userId: 1, date: 1 });

// Update the updatedAt field on save
calendarNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CalendarNote', calendarNoteSchema);
