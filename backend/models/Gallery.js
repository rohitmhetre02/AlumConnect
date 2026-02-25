const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    enum: [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ]
  },
  folder: {
    type: String,
    required: true,
    enum: ['Events', 'Campus', 'Traditional Day', 'Alumni Meet', 'Industrial Visit']
  },
  imageName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
