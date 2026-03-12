const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const MentorApplication = require('../models/MentorApplication')
const natural = require('natural')

// Helper function to get user model based on role
const getUserModel = (role) => {
  return role === 'alumni' ? Alumni : Student
}

// Helper function to get user by ID and role
const getUserById = async (userId, role) => {
  const UserModel = getUserModel(role)
  return await UserModel.findById(userId)
}

// TF-IDF Similarity Calculation
const calculateTFIDFSimilarity = (studentText, mentorText) => {
  try {
    const tfidf = new natural.TfIdf()
    
    // Add documents to TF-IDF
    tfidf.addDocument(studentText)
    tfidf.addDocument(mentorText)
    
    // Calculate similarity using cosine similarity
    const studentVector = []
    const mentorVector = []
    
    // Get all terms from both documents
    const terms = new Set()
    const studentTerms = studentText.toLowerCase().split(/\s+/).filter(term => term.length > 2)
    const mentorTerms = mentorText.toLowerCase().split(/\s+/).filter(term => term.length > 2)
    
    studentTerms.forEach(term => terms.add(term))
    mentorTerms.forEach(term => terms.add(term))
    
    // Create vectors
    terms.forEach(term => {
      const studentTfidf = tfidf.tfidf(term, 0) // Document 0 is student
      const mentorTfidf = tfidf.tfidf(term, 1)  // Document 1 is mentor
      studentVector.push(studentTfidf)
      mentorVector.push(mentorTfidf)
    })
    
    // Calculate cosine similarity
    let dotProduct = 0
    let studentMagnitude = 0
    let mentorMagnitude = 0
    
    for (let i = 0; i < studentVector.length; i++) {
      dotProduct += studentVector[i] * mentorVector[i]
      studentMagnitude += studentVector[i] * studentVector[i]
      mentorMagnitude += mentorVector[i] * mentorVector[i]
    }
    
    studentMagnitude = Math.sqrt(studentMagnitude)
    mentorMagnitude = Math.sqrt(mentorMagnitude)
    
    if (studentMagnitude === 0 || mentorMagnitude === 0) {
      return 0
    }
    
    return dotProduct / (studentMagnitude * mentorMagnitude)
  } catch (error) {
    console.error('Error calculating TF-IDF similarity:', error)
    return 0
  }
}

// Normalize skills for better matching
const normalizeSkill = (skill) => {
  return skill
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

// Normalize array of skills
const normalizeSkills = (skills) => {
  if (!skills || !Array.isArray(skills)) return []
  return skills.map(skill => normalizeSkill(skill)).filter(Boolean)
}

// Prepare enhanced student text for TF-IDF
const prepareStudentText = (user, preferences) => {
  const textParts = []
  
  // Add career goals and interests
  if (user.careerGoals) textParts.push(user.careerGoals)
  if (user.interests) {
    if (Array.isArray(user.interests)) {
      textParts.push(user.interests.join(' '))
    } else {
      textParts.push(user.interests)
    }
  }
  
  // Add user skills
  if (user.skills && Array.isArray(user.skills)) {
    textParts.push(user.skills.join(' '))
  }
  
  // Add preferences (skills they want to learn)
  if (preferences.skills && Array.isArray(preferences.skills)) {
    textParts.push(preferences.skills.join(' '))
  }
  
  // Add career interest and industry
  if (preferences.careerInterest) textParts.push(preferences.careerInterest)
  if (preferences.preferredIndustry) textParts.push(preferences.preferredIndustry)
  
  return textParts.filter(Boolean).join(' ').toLowerCase()
}

// Prepare mentor text for TF-IDF
const prepareMentorText = (mentor) => {
  const textParts = []
  
  // Add expertise areas
  if (mentor.expertise && Array.isArray(mentor.expertise)) {
    textParts.push(mentor.expertise.join(' '))
  }
  
  // Add mentorship areas
  if (mentor.mentorshipAreas && Array.isArray(mentor.mentorshipAreas)) {
    textParts.push(mentor.mentorshipAreas.join(' '))
  }
  
  // Add bio/about
  if (mentor.bio) textParts.push(mentor.bio)
  if (mentor.aboutMentor) textParts.push(mentor.aboutMentor)
  
  // Add experience description
  if (mentor.experienceDescription) textParts.push(mentor.experienceDescription)
  if (mentor.experience) textParts.push(mentor.experience)
  
  // Add industry and department
  if (mentor.industry) textParts.push(mentor.industry)
  if (mentor.department) textParts.push(mentor.department)
  
  return textParts.join(' ').toLowerCase()
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

    // Prepare text for TF-IDF analysis
    const studentText = prepareStudentText(user, preferences)
    
    // Calculate scores for each mentor
    const mentorScores = mentors.map(mentor => {
      let ruleBasedScore = 0
      const reasons = []

      // Normalize skills for better matching
      const normalizedUserSkills = normalizeSkills(user.skills || [])
      const normalizedPreferredSkills = normalizeSkills(preferences.skills || [])
      const normalizedMentorExpertise = normalizeSkills(mentor.expertise || [])

      // Rule 1: Same department = +5
      if (user.department && mentor.department && 
          user.department.toLowerCase() === mentor.department.toLowerCase()) {
        ruleBasedScore += 5
        reasons.push('Same department')
      }

      // Rule 2: Enhanced skill matching with different weights
      let existingSkillMatches = []
      let learningSkillMatches = []

      // Check existing skills (lower weight +3)
      normalizedUserSkills.forEach(userSkill => {
        if (normalizedMentorExpertise.some(mentorSkill => 
          mentorSkill === userSkill || mentorSkill.includes(userSkill) || userSkill.includes(mentorSkill)
        )) {
          existingSkillMatches.push(userSkill)
        }
      })

      // Check skills to learn (higher weight +6)
      normalizedPreferredSkills.forEach(preferredSkill => {
        if (normalizedMentorExpertise.some(mentorSkill => 
          mentorSkill === preferredSkill || mentorSkill.includes(preferredSkill) || preferredSkill.includes(mentorSkill)
        )) {
          learningSkillMatches.push(preferredSkill)
        }
      })

      // Add scores for skill matches
      if (existingSkillMatches.length > 0) {
        ruleBasedScore += existingSkillMatches.length * 3
        reasons.push(`${existingSkillMatches.length} existing skill match(es): ${existingSkillMatches.join(', ')}`)
      }

      if (learningSkillMatches.length > 0) {
        ruleBasedScore += learningSkillMatches.length * 6
        reasons.push(`${learningSkillMatches.length} skill(s) you want to learn: ${learningSkillMatches.join(', ')}`)
      }

      // Rule 3: Matching mentorshipAreas with careerInterest = +4
      if (preferences.careerInterest && mentor.mentorshipAreas) {
        const careerMatch = mentor.mentorshipAreas.some(area =>
          area.toLowerCase().includes(preferences.careerInterest.toLowerCase()) ||
          preferences.careerInterest.toLowerCase().includes(area.toLowerCase())
        )
        if (careerMatch) {
          ruleBasedScore += 4
          reasons.push('Career interest match')
        }
      }

      // Rule 4: Matching industry with preferredIndustry = +2
      if (preferences.preferredIndustry && mentor.industry &&
          mentor.industry.toLowerCase().includes(preferences.preferredIndustry.toLowerCase()) ||
          preferences.preferredIndustry.toLowerCase().includes(mentor.industry.toLowerCase())) {
        ruleBasedScore += 2
        reasons.push('Industry match')
      }

      // Rule 5: Mentor experience >= preferredExperience = +2
      if (preferences.preferredExperience && mentor.yearsOfExperience) {
        const mentorExpNum = parseInt(mentor.yearsOfExperience.replace(/\D/g, '')) || 0
        const preferredExpNum = parseInt(preferences.preferredExperience.replace(/\D/g, '')) || 0
        
        if (mentorExpNum >= preferredExpNum) {
          ruleBasedScore += 2
          reasons.push('Experience requirement met')
        }
      }

      // Rule 6: Mentor rating support (future-ready)
      let ratingScore = 0
      if (mentor.rating && typeof mentor.rating === 'number' && mentor.rating > 0) {
        ratingScore = Math.round(mentor.rating * 2)
        reasons.push(`Highly rated mentor (${mentor.rating}⭐)`)
      }

      // TF-IDF Similarity Calculation
      const mentorText = prepareMentorText(mentor)
      const tfidfSimilarity = calculateTFIDFSimilarity(studentText, mentorText)
      
      // Add TF-IDF reason if similarity is significant (> 0.1)
      if (tfidfSimilarity > 0.1) {
        reasons.push('High similarity with your career goals')
      }
      
      // Calculate final score with increased TF-IDF weight (x15 instead of x10)
      const finalScore = ruleBasedScore + (tfidfSimilarity * 15) + ratingScore

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
        rating: mentor.rating,
        feedbackCount: mentor.feedbackCount,
        user: mentor.user,
        score: finalScore,
        ruleBasedScore,
        tfidfSimilarity: Math.round(tfidfSimilarity * 100) / 100,
        ratingScore,
        matchPercentage: 0, // Will be calculated dynamically below
        recommendationReasons: reasons
      }
    })

    // Sort by score descending and calculate dynamic match percentages
    const sortedMentors = mentorScores.sort((a, b) => b.score - a.score)
    
    // Calculate dynamic match percentage based on highest score
    const highestScore = sortedMentors.length > 0 ? sortedMentors[0].score : 1
    
    const recommendedMentors = sortedMentors.slice(0, 5).map(mentor => ({
      ...mentor,
      matchPercentage: Math.round((mentor.score / highestScore) * 100)
    }))

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
