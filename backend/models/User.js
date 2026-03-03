const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date
  },
  personalEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'faculty', 'coordinator', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  about: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  cover: {
    type: String,
    default: ''
  },
  socials: {
    linkedin: String,
    github: String,
    instagram: String,
    customSocials: [{
      label: String,
      url: String
    }]
  },
  skills: [{
    type: String
  }],
  certifications: [{
    title: String,
    organization: String,
    location: String,
    date: Date,
    file: String,
    fileName: String,
    fileType: String
  }],
  experiences: [{
    title: String,
    company: String,
    type: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    otherDegree: String,
    field: String,
    department: String,
    admissionYear: Number,
    passoutYear: Number,
    expectedPassoutYear: Number,
    isCurrent: Boolean,
    cgpa: String,
    grade: String
  }],
  currentYear: Number,
  passoutYear: Number,
  expectedPassoutYear: Number,
  profileApprovalStatus: {
    type: String,
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  isProfileApproved: {
    type: Boolean,
    default: false
  },
  stats: {
    connections: { type: Number, default: 0 },
    mentorships: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
