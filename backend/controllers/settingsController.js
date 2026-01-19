const Settings = require('../models/Settings')

const getSettings = async (_req, res) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }
    return res.status(200).json({ success: true, data: settings })
  } catch (error) {
    console.error('getSettings error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch settings.' })
  }
}

const updateSettings = async (req, res) => {
  try {
    const updates = req.body
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create(updates)
    } else {
      Object.assign(settings, updates)
      await settings.save()
    }
    return res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully.' })
  } catch (error) {
    console.error('updateSettings error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update settings.' })
  }
}

module.exports = {
  getSettings,
  updateSettings,
}
