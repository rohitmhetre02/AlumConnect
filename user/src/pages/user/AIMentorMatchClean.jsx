import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMentors } from '../../hooks/useMentors'
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton'

const STEP_LABELS = ['Your Goals', 'Your Background', 'Your Skills']
const gradientBg = 'bg-gradient-to-br from-[#eef2ff] via-[#fafaff] to-[#ffffff]'

const interestPalette = [
  '#FF8A80', '#FF80AB', '#B388FF', '#8C9EFF', '#80D8FF',
  '#A7FFEB', '#CCFF90', '#FFE082', '#FFAB91', '#CFD8DC',
]

const skillPalette = [
  '#4FC3F7', '#4DB6AC', '#81C784', '#AED581', '#FFD54F',
  '#FF8A65', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6',
]

const StepIndicator = ({ current }) => (
  <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600">
    {STEP_LABELS.map((label, index) => {
      const stepNumber = index + 1
      const isActive = stepNumber === current
      const isCompleted = stepNumber < current

      return (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
              isActive
                ? 'bg-gradient-to-br from-[#4361ee] to-[#4cc9f0] text-white shadow-lg shadow-blue-200/60'
                : isCompleted
                ? 'border border-slate-300 bg-white text-slate-700'
                : 'border border-slate-200 bg-white text-slate-400'
            }`}
          >
            {stepNumber}
          </span>
          <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
          {stepNumber < STEP_LABELS.length ? <span className="text-slate-300">⟶</span> : null}
        </div>
      )
    })}
  </div>
)

const ChipGrid = ({ title, description, options, selected, onToggle, palette, multiSelect = true }) => (
  <section className="space-y-4">
    <header>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </header>
    <div className="flex flex-wrap gap-3">
      {options.map((option, index) => {
        const isActive = selected.includes(option)
        const color = palette[index % palette.length]
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            style={isActive ? { background: color, borderColor: color } : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'text-white shadow-lg shadow-slate-400/30'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  </section>
)

const LoadingPulse = () => (
  <div className="mx-auto max-w-xl space-y-3 rounded-3xl border border-slate-200 bg-white/70 p-6 text-center text-slate-600 shadow-lg shadow-blue-100/40 backdrop-blur">
    <div className="flex items-center justify-center gap-3">
      <span className="h-3 w-3 animate-ping rounded-full bg-[#4361ee]"></span>
      <span className="h-3 w-3 animate-ping rounded-full bg-[#4cc9f0] [animation-delay:150ms]"></span>
      <span className="h-3 w-3 animate-ping rounded-full bg-[#4895ef] [animation-delay:300ms]"></span>
    </div>
    <p className="text-sm font-semibold tracking-wide text-slate-700">Finding your ideal mentors...</p>
    <p className="text-xs text-slate-500">This usually takes a few moments.</p>
  </div>
)

const MatchCard = ({ match, onViewProfile }) => {
  const { mentor, matchScore, shortReason } = match
  if (!mentor) return null
  
  // Debug: Log mentor data to see available fields
  console.log('Mentor data:', mentor)
  
  const scoreTone = matchScore >= 80 ? 'text-emerald-500' : matchScore >= 60 ? 'text-amber-500' : 'text-slate-600'

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Strong Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Partial Match'
    return 'Low Match'
  }

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={mentor.avatar || 'https://picsum.photos/seed/mentor/100/100.jpg'} alt={`${mentor.fullName || mentor.name} avatar`} className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{mentor.fullName || mentor.name}</h3>
            <p className="text-sm text-slate-500">{mentor.jobRole || mentor.position || mentor.currentRole}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-semibold ${scoreTone}`}>{matchScore}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{getMatchLabel(matchScore)}</p>
        </div>
      </header>
      <p className="text-sm text-slate-600">{shortReason}</p>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {(mentor.expertise || mentor.skills || [])?.slice(0, 4)?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={() => onViewProfile(mentor)}
        className="w-full rounded-2xl bg-gradient-to-r from-[#4361ee] to-[#4cc9f0] py-3 text-center font-semibold text-white shadow-lg transition hover:shadow-xl"
      >
        View Profile
      </button>
    </article>
  )
}

const AIMentorMatch = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items: mentors, loading: mentorsLoading } = useMentors()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [matches, setMatches] = useState([])
  const [userProfile, setUserProfile] = useState({
    goals: [],
    background: '',
    skills: [],
    experience: ''
  })

  // Question options
  const goalOptions = [
    'Career guidance',
    'Job / placement preparation', 
    'Skill improvement',
    'Higher studies',
    'Startup / entrepreneurship',
    'Leadership / management growth'
  ]

  const backgroundOptions = [
    'Student',
    'Fresher', 
    'Working professional',
    'Career switcher',
    'Founder / Entrepreneur'
  ]

  const skillOptions = [
    'Frontend Development',
    'Backend Development', 
    'Full Stack Development',
    'UI/UX Design',
    'Product Design',
    'Artificial Intelligence',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Business Strategy',
    'Business Management',
    'Marketing',
    'Sales',
    'Research',
    'Academics',
    'Teaching',
    'Project Management',
    'Leadership'
  ]

  const experienceOptions = ['Beginner', 'Intermediate', 'Advanced']

  // Handle selections
  const handleGoalToggle = (goal) => {
    setUserProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleBackgroundSelect = (background) => {
    setUserProfile(prev => ({ ...prev, background }))
  }

  const handleSkillToggle = (skill) => {
    setUserProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleExperienceSelect = (experience) => {
    setUserProfile(prev => ({ ...prev, experience }))
  }

  // Navigation
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      generateMatches()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Generate matches
  const generateMatches = async () => {
    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    const scoredMentors = mentors.map(mentor => {
      let score = 0
      
      // Normalize mentor data
      const mentorFocus = Array.isArray(mentor.mentorshipAreas) ? mentor.mentorshipAreas : 
                         Array.isArray(mentor.expertise) ? mentor.expertise : []
      const mentorSkills = Array.isArray(mentor.skills) ? mentor.skills : 
                          Array.isArray(mentor.expertise) ? mentor.expertise : []
      
      // START WITH HIGH BASE SCORE
      score += 50 // Everyone starts with 50 points
      
      // Goal alignment (25 points)
      const goalMatch = userProfile.goals.some(goal => 
        mentorFocus.some(area => area && area.toLowerCase().includes(goal.toLowerCase()))
      )
      if (goalMatch) score += 25
      
      // Background similarity (20 points)
      if (userProfile.background === 'Student' && mentor.role?.toLowerCase().includes('academic')) score += 20
      if (userProfile.background === 'Working professional' && mentor.experience > 3) score += 20
      if (userProfile.background === 'Fresher' && mentor.experience > 2) score += 20
      if (userProfile.background === 'Career switcher' && mentor.experience > 5) score += 20
      if (userProfile.background === 'Founder / Entrepreneur' && mentor.role?.toLowerCase().includes('founder')) score += 20

      // Skill overlap (15 points per skill, max 30)
      const skillMatches = userProfile.skills.filter(skill =>
        mentorSkills.some(ms => ms && ms.toLowerCase().includes(skill.toLowerCase()))
      )
      score += Math.min(30, skillMatches.length * 15)

      // Experience relevance (15 points)
      if (userProfile.experience === 'Beginner' && mentor.experience >= 2) score += 15
      if (userProfile.experience === 'Intermediate' && mentor.experience >= 4) score += 15
      if (userProfile.experience === 'Advanced' && mentor.experience >= 6) score += 15
      if (!userProfile.experience) score += 10 // Bonus if experience not specified

      // Bonus points for good profiles
      if (mentor.experience >= 5) score += 5
      if (mentor.experience >= 10) score += 5
      if (mentorFocus.length > 0) score += 5
      if (mentorSkills.length > 0) score += 5

      // Bonus for multiple matches
      if (goalMatch && skillMatches.length > 0) score += 10
      if (skillMatches.length >= 2) score += 5
      if (skillMatches.length >= 3) score += 5

      return {
        mentor,
        matchScore: Math.min(100, score + Math.floor(Math.random() * 10)), // Small random boost
        shortReason: generateReason(mentor, userProfile)
      }
    })

    // Filter for 75+ scores only and sort by score (lowered threshold for more matches)
    const topMatches = scoredMentors
      .filter(match => match.matchScore >= 75)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    setMatches(topMatches)
    setIsGenerating(false)
    // Set step to 4 to show results (beyond the 3 steps)
    setCurrentStep(4)
  }

  const generateReason = (mentor, profile) => {
    const reasons = []
    
    if (profile.goals.length > 0) {
      reasons.push(`Aligns with your ${profile.goals[0]} goals`)
    }
    
    if (profile.skills.length > 0) {
      const mentorSkills = Array.isArray(mentor.skills) ? mentor.skills : 
                          Array.isArray(mentor.expertise) ? mentor.expertise : []
      const matchingSkill = mentorSkills.find(skill => 
        skill && profile.skills.some(userSkill => skill.toLowerCase().includes(userSkill.toLowerCase()))
      )
      if (matchingSkill) {
        reasons.push(`Expert in ${matchingSkill}`)
      }
    }
    
    if (profile.background && mentor.experience) {
      reasons.push(`${mentor.experience}+ years of experience`)
    }
    
    return reasons.join(' • ') || 'Strong industry expertise and mentorship experience'
  }

  const handleViewProfile = (mentor) => {
    // Check multiple possible ID fields that mentors might have
    const mentorId = mentor._id || mentor.id || mentor.mentorId || mentor.userId
    
    if (!mentorId) {
      console.error('Mentor ID not found:', mentor)
      // Show error message to user
      alert('Mentor profile not available. Please try again later.')
      return
    }
    
    console.log('Navigating to mentor profile:', mentorId)
    navigate(`/dashboard/mentors/${mentorId}`)
  }

  const handleRestart = () => {
    setCurrentStep(1)
    setMatches([])
    setUserProfile({
      goals: [],
      background: '',
      skills: [],
      experience: ''
    })
  }

  // Step validation
  const canProceed = () => {
    switch (currentStep) {
      case 1: return userProfile.goals.length > 0
      case 2: return userProfile.background !== ''
      case 3: return userProfile.skills.length > 0
      default: return true
    }
  }

  if (mentorsLoading) {
    return (
      <div className={`min-h-screen ${gradientBg} flex items-center justify-center`}>
        <LoadingPulse />
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className={`min-h-screen ${gradientBg} flex items-center justify-center`}>
        <LoadingPulse />
      </div>
    )
  }

  if (matches.length > 0) {
    return (
      <div className={`min-h-screen ${gradientBg}`}>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Mentor Recommendations</h1>
            <p className="text-slate-600">Based on your profile, we found these high-quality mentors (75+ match score)</p>
          </header>

          <div className="mb-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Your Profile Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Goals:</span>
                  <p className="font-medium text-slate-900">{userProfile.goals.join(', ')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Background:</span>
                  <p className="font-medium text-slate-900">{userProfile.background}</p>
                </div>
                <div>
                  <span className="text-slate-500">Skills:</span>
                  <p className="font-medium text-slate-900">{userProfile.skills.join(', ')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Experience:</span>
                  <p className="font-medium text-slate-900">{userProfile.experience || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match, index) => (
              <MatchCard key={index} match={match} onViewProfile={handleViewProfile} />
            ))}
          </div>

          {matches.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Strong Matches Found</h3>
              <p className="text-slate-600 mb-6">
                We couldn't find mentors with 75+ match score based on your current preferences. 
                Try adjusting your selections to get more matches.
              </p>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                Update Your Preferences
              </button>
            </div>
          )}

          {matches.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={handleRestart}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${gradientBg}`}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 text-center">
          <div className="mb-4">
            <button
              onClick={() => navigate('/dashboard/mentorship')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Mentorship
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Perfect Mentor</h1>
          <p className="text-slate-600">Answer a few questions to get personalized mentor recommendations</p>
        </header>

        <StepIndicator current={currentStep} />

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-lg">
          {currentStep === 1 && (
            <ChipGrid
              title="What are your primary goals?"
              description="Select all that apply (choose at least one)"
              options={goalOptions}
              selected={userProfile.goals}
              onToggle={handleGoalToggle}
              palette={interestPalette}
            />
          )}

          {currentStep === 2 && (
            <ChipGrid
              title="What's your current background?"
              description="Select one option that best describes you"
              options={backgroundOptions}
              selected={userProfile.background ? [userProfile.background] : []}
              onToggle={handleBackgroundSelect}
              palette={skillPalette}
              multiSelect={false}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <ChipGrid
                title="What skills or areas interest you?"
                description="Select all that apply (choose at least one)"
                options={skillOptions}
                selected={userProfile.skills}
                onToggle={handleSkillToggle}
                palette={interestPalette}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Experience Level (Optional)</h3>
                <p className="text-sm text-slate-500">Help us find mentors with the right experience level</p>
                <div className="flex flex-wrap gap-3">
                  {experienceOptions.map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => handleExperienceSelect(exp)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        userProfile.experience === exp
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={currentStep === 1 ? () => navigate('/dashboard/mentorship') : handlePrevious}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {currentStep === 1 ? 'Back to Mentorship' : 'Previous'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`rounded-2xl px-6 py-3 font-semibold text-white shadow-lg transition ${
                canProceed()
                  ? 'bg-gradient-to-r from-[#4361ee] to-[#4cc9f0] hover:shadow-xl'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {currentStep === 3 ? 'Get Recommendations' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIMentorMatch
