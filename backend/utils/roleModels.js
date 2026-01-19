const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const Faculty = require('../models/Faculty')
const Admin = require('../models/Admin')
const Coordinator = require('../models/Coordinator')
const Opportunity = require('../models/Opportunity')
const Event = require('../models/Event')
const Donation = require('../models/Donation')
const News = require('../models/News')

const ROLE_MODEL_MAP = {
  admin: Admin,
  coordinator: Coordinator,
  student: Student,
  alumni: Alumni,
  faculty: Faculty,
  opportunity: Opportunity,
  event: Event,
  donation: Donation,
  news: News,
}

const getModelByRole = (role = '') => ROLE_MODEL_MAP[role]

module.exports = {
  ROLE_MODEL_MAP,
  getModelByRole,
}
