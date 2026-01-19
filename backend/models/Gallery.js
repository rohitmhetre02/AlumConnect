const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'uploadedByRole',
    required: true,
  },
  uploadedByRole: {
    type: String,
    enum: ['student', 'alumni', 'faculty', 'admin', 'coordinator'],
    required: true,
  },
  uploadedByName: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Gallery', gallerySchema)
