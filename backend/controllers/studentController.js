const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const MentorApplication = require('../models/MentorApplication')

// Helper function to get user model based on role
const getUserModel = (role) => {
  return role === 'alumni' ? Alumni : Student
}

// Helper function to get user by ID and role
const getUserById = async (userId, role) => {
  const UserModel = getUserModel(role)
  return await UserModel.findById(userId)
}

// Save user preferences (for both students and alumni)
const savePreferences = async (req, res) => {
  try {
    // Allow both students and alumni
    if (!['student', 'alumni'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Student or Alumni role required.' })
    }

    const userId = req.user.id
    const { careerInterest, skills, preferredIndustry, preferredExperience } = req.body

    // Validate input
    if (!careerInterest || !skills || !Array.isArray(skills) || !preferredIndustry || !preferredExperience) {
      return res.status(400).json({ 
        message: 'All fields are required: careerInterest, skills (array), preferredIndustry, preferredExperience' 
      })
    }

    // Get the appropriate user model
    const UserModel = getUserModel(req.user.role)

    // Update user preferences
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'mentorPreferences.careerInterest': careerInterest,
          'mentorPreferences.skills': skills,
          'mentorPreferences.preferredIndustry': preferredIndustry,
          'mentorPreferences.preferredExperience': preferredExperience
        }
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      message: 'Preferences saved successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error saving user preferences:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get recommended mentors for user (both students and alumni)
const getRecommendedMentors = async (req, res) => {
  try {
    // Allow both students and alumni
    if (!['student', 'alumni'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Student or Alumni role required.' })
    }

    const userId = req.user.id

    // Get user profile with preferences
    const user = await getUserById(userId, req.user.role)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const preferences = user.mentorPreferences || {}
    
    // Get all approved mentors
    const mentors = await MentorApplication.find({ 
      status: 'approved' 
    }).populate('user', 'firstName lastName email avatar')

    if (!mentors || mentors.length === 0) {
      return res.status(200).json({ mentors: [] })
    }

    // Calculate scores for each mentor
    const mentorScores = mentors.map(mentor => {
      let score = 0
      const reasons = []

      // Rule 1: Same department = +5
      if (user.department && mentor.department && 
          user.department.toLowerCase() === mentor.department.toLowerCase()) {
        score += 5
        reasons.push('Same department')
      }

      // Rule 2: Matching skills = +3 per match
      const userSkills = [...(user.skills || []), ...(preferences.skills || [])]
      const mentorExpertise = mentor.expertise || []
      const skillMatches = userSkills.filter(skill => 
        mentorExpertise.some(expertise => 
          expertise.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(expertise.toLowerCase())
        )
      )
      if (skillMatches.length > 0) {
        score += skillMatches.length * 3
        reasons.push(`${skillMatches.length} skill match(es): ${skillMatches.join(', ')}`)
      }

      // Rule 3: Matching mentorshipAreas with careerInterest = +4
      if (preferences.careerInterest && mentor.mentorshipAreas) {
        const careerMatch = mentor.mentorshipAreas.some(area =>
          area.toLowerCase().includes(preferences.careerInterest.toLowerCase()) ||
          preferences.careerInterest.toLowerCase().includes(area.toLowerCase())
        )
        if (careerMatch) {
          score += 4
          reasons.push('Career interest match')
        }
      }

      // Rule 4: Matching industry with preferredIndustry = +2
      if (preferences.preferredIndustry && mentor.industry &&
          mentor.industry.toLowerCase().includes(preferences.preferredIndustry.toLowerCase()) ||
          preferences.preferredIndustry.toLowerCase().includes(mentor.industry.toLowerCase())) {
        score += 2
        reasons.push('Industry match')
      }

      // Rule 5: Mentor experience >= preferredExperience = +2
      if (preferences.preferredExperience && mentor.yearsOfExperience) {
        // Extract numbers from experience strings
        const mentorExpNum = parseInt(mentor.yearsOfExperience.replace(/\D/g, '')) || 0
        const preferredExpNum = parseInt(preferences.preferredExperience.replace(/\D/g, '')) || 0
        
        if (mentorExpNum >= preferredExpNum) {
          score += 2
          reasons.push('Experience requirement met')
        }
      }

      // Calculate match percentage (max score is around 20-30, normalize to 100)
      const maxPossibleScore = 25 // Approximate max score
      const matchPercentage = Math.min(Math.round((score / maxPossibleScore) * 100), 100)

      return {
        mentorId: mentor._id,
        fullName: mentor.fullName,
        currentJobTitle: mentor.currentJobTitle,
        company: mentor.company,
        industry: mentor.industry,
        department: mentor.department,
        expertise: mentor.expertise,
        mentorshipAreas: mentor.mentorshipAreas,
        yearsOfExperience: mentor.yearsOfExperience,
        mentorshipMode: mentor.mentorshipMode,
        maxMentees: mentor.maxMentees,
        profilePhoto: mentor.profilePhoto,
        user: mentor.user,
        score,
        matchPercentage,
        recommendationReasons: reasons
      }
    })

    // Sort by score descending and return top 5
    const recommendedMentors = mentorScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    res.status(200).json({ mentors: recommendedMentors })
  } catch (error) {
    console.error('Error getting recommended mentors:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get user preferences (both students and alumni)
const getPreferences = async (req, res) => {
  try {
    // Allow both students and alumni
    if (!['student', 'alumni'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Student or Alumni role required.' })
    }

    const userId = req.user.id
    const user = await getUserById(userId, req.user.role)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ 
      preferences: user.mentorPreferences || {
        careerInterest: '',
        skills: [],
        preferredIndustry: '',
        preferredExperience: ''
      }
    })
  } catch (error) {
    console.error('Error getting user preferences:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  savePreferences,
  getRecommendedMentors,
  getPreferences
}
