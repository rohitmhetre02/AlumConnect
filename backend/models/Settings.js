const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'AlumConnect Admin' },
  siteEmail: { type: String, default: 'admin@alumconnect.com' },
  maintenance: { type: Boolean, default: false },
  notifications: { type: Boolean, default: true },
  analytics: { type: Boolean, default: true },
  theme: { type: String, default: 'light' },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  itemsPerPage: { type: String, default: '10' },
  autoSave: { type: Boolean, default: true },
  sessionTimeout: { type: String, default: '30' },
  twoFactorAuth: { type: Boolean, default: false },
  ipWhitelist: { type: Boolean, default: false },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Settings', settingsSchema)
