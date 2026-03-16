const mongoose = require('mongoose')

// Load MentorRequest model safely
let MentorRequest
try {
  MentorRequest = require('./models/MentorRequest')
} catch (err) {
  console.error('❌ MentorRequest model not found. Check models folder.')
}

/**
 * Debug function to inspect a mentorship request
 */
const debugMentorRequest = async (requestId) => {
  try {
    console.log('\n========== DEBUGGING MENTOR REQUEST ==========')
    console.log('Request ID:', requestId)

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      console.log('❌ Invalid Request ID')
      return null
    }

    if (!MentorRequest) {
      console.log('❌ MentorRequest model not loaded')
      return null
    }

    const request = await MentorRequest.findById(requestId)
      .populate({
        path: 'mentee',
        select: 'firstName lastName email avatar',
        model: 'Student',
      })
      .populate({
        path: 'mentor',
        select: 'firstName lastName email avatar',
        model: 'Alumni',
      })

    if (!request) {
      console.log('❌ Request not found')
      return null
    }

    console.log('\n------ Request Data ------')
    console.log('Status:', request.status)
    console.log('Service Name:', request.serviceName)
    console.log('Request Message:', request.requestMessage)
    console.log('Preferred Date:', request.preferredDateTime)
    console.log('Preferred Mode:', request.preferredMode)
    console.log('Scheduled Date:', request.scheduledDateTime)
    console.log('Scheduled Mode:', request.scheduledMode)
    console.log('Meeting Link:', request.meetingLink)
    console.log('Notes:', request.notes)

    console.log('\n------ Mentee Data ------')
    if (request.mentee) {
      console.log(
        'Mentee Name:',
        request.mentee.firstName + ' ' + request.mentee.lastName,
      )
      console.log('Mentee Email:', request.mentee.email)
      console.log('Mentee Avatar:', request.mentee.avatar)
    } else {
      console.log('Mentee: Not populated')
      console.log('Stored Name:', request.menteeName)
      console.log('Stored Email:', request.menteeEmail)
    }

    console.log('\n------ Mentor Data ------')
    if (request.mentor) {
      console.log(
        'Mentor Name:',
        request.mentor.firstName + ' ' + request.mentor.lastName,
      )
      console.log('Mentor Email:', request.mentor.email)
      console.log('Mentor Avatar:', request.mentor.avatar)
    } else {
      console.log('Mentor: Not populated')
      console.log('Stored Name:', request.mentorName)
      console.log('Stored Email:', request.mentorEmail)
    }

    console.log('\n------ Proposed Slots ------')
    console.log(JSON.stringify(request.proposedSlots, null, 2))

    console.log('\n========== DEBUG COMPLETE ==========\n')

    return request
  } catch (error) {
    console.error('❌ Debug error:', error.message)
    return null
  }
}

module.exports = { debugMentorRequest }
