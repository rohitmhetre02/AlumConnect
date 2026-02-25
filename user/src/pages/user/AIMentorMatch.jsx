import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMentors } from '../../hooks/useMentors'
import MentorCard from '../../components/user/mentorship/MentorCard'
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
          <img src={mentor.avatar} alt={`${mentor.fullName} avatar`} className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{mentor.fullName}</h3>
            <p className="text-sm text-slate-500">{mentor.jobRole || mentor.position}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-semibold ${scoreTone}`}>{matchScore}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{getMatchLabel(matchScore)}</p>
        </div>
      </header>
      <p className="text-sm text-slate-600">{shortReason}</p>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {mentor.expertise?.slice(0, 4)?.map((tag) => (
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
    'Frontend / Backend / Full Stack',
    'UI/UX / Product Design',
    'AI / Data / DevOps', 
    'Business / Management',
    'Research / Academics'
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
      
      // Goal alignment (30%)
      const mentorFocus = mentor.mentorshipAreas || []
      const goalMatch = userProfile.goals.some(goal => 
        mentorFocus.some(area => area.toLowerCase().includes(goal.toLowerCase()))
      )
      if (goalMatch) score += 30

      // Background similarity (20%)
      if (userProfile.background === 'Student' && mentor.role?.toLowerCase().includes('academic')) score += 20
      if (userProfile.background === 'Working professional' && mentor.experience > 5) score += 20
      if (userProfile.background === 'Founder / Entrepreneur' && mentor.role?.toLowerCase().includes('founder')) score += 20

      // Skill overlap (35%)
      const mentorSkills = mentor.skills || []
      const skillMatch = userProfile.skills.some(skill =>
        mentorSkills.some(ms => ms.toLowerCase().includes(skill.toLowerCase()))
      )
      if (skillMatch) score += 35

      // Experience relevance (15%)
      if (userProfile.experience === 'Beginner' && mentor.experience >= 3) score += 15
      if (userProfile.experience === 'Intermediate' && mentor.experience >= 5) score += 15
      if (userProfile.experience === 'Advanced' && mentor.experience >= 8) score += 15

      return {
        mentor,
        matchScore: Math.min(100, score + Math.floor(Math.random() * 20)),
        shortReason: generateReason(mentor, userProfile)
      }
    })

    const topMatches = scoredMentors
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    setMatches(topMatches)
    setIsGenerating(false)
  }

  const generateReason = (mentor, profile) => {
    const reasons = []
    
    if (profile.goals.length > 0) {
      reasons.push(`Aligns with your ${profile.goals[0]} goals`)
    }
    
    if (profile.skills.length > 0 && mentor.skills) {
      const matchingSkill = mentor.skills.find(skill => 
        profile.skills.some(userSkill => skill.toLowerCase().includes(userSkill.toLowerCase()))
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
    navigate(`/dashboard/mentorship/${mentor._id}`)
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
            <p className="text-slate-600">Based on your profile, we found these mentors for you</p>
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

          <div className="mt-8 text-center">
            <button
              onClick={handleRestart}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${gradientBg}`}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 text-center">
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

const ChipGrid = ({ title, description, options, selected, onToggle, palette }) => (
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
    <p className="text-sm font-semibold tracking-wide text-slate-700">Analyzing your profile with Gemini...</p>
    <p className="text-xs text-slate-500">This usually takes a few moments.</p>
  </div>
)

const MatchCard = ({ match, onViewProfile }) => {
  const { mentor, matchScore, shortReason } = match
  if (!mentor) return null
  const scoreTone = matchScore >= 85 ? 'text-emerald-500' : matchScore >= 70 ? 'text-amber-500' : 'text-slate-600'

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={mentor.avatar} alt={`${mentor.fullName} avatar`} className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-md" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{mentor.fullName}</h3>
            <p className="text-sm text-slate-500">{mentor.jobRole || mentor.position}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-semibold ${scoreTone}`}>{matchScore}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">Match Score</p>
        </div>
      </header>
      <p className="text-sm text-slate-600">{shortReason}</p>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {mentor.expertise?.slice(0, 4)?.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">
            {tag}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onViewProfile}
        className="self-start rounded-full bg-gradient-to-r from-[#4361ee] to-[#4cc9f0] px-5 py-2 text-sm font-semibold text-white transition hover:from-[#3a56d2] hover:to-[#3db3d8]"
      >
        View Mentor Profile
      </button>
    </article>
  )
}

const normalizeArr = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const uniq = (list) => Array.from(new Set(list))

const AIMentorMatch = () => {
  const navigate = useNavigate()
  const addToast = useToast()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [interests, setInterests] = useState([])
  const [skills, setSkills] = useState([])
  const [careerGoals, setCareerGoals] = useState('')
  const [matches, setMatches] = useState([])
  const [mentors, setMentors] = useState([])
  const [userProfile, setUserProfile] = useState(null)

  const profileSnapshot = user?.profile || {}

  const derivedInterests = useMemo(() => {
    const fromProfile = normalizeArr(profileSnapshot.interests)
    const fromMentors = mentors.flatMap((mentor) => normalizeArr(mentor.categories))
    return uniq([...fromProfile, ...fromMentors]).slice(0, 25)
  }, [profileSnapshot.interests, mentors])

  const derivedSkills = useMemo(() => {
    const fromProfile = normalizeArr(profileSnapshot.skills)
    const fromMentorExpertise = mentors.flatMap((mentor) => normalizeArr(mentor.expertise))
    return uniq([...fromProfile, ...fromMentorExpertise]).slice(0, 30)
  }, [profileSnapshot.skills, mentors])

  useEffect(() => {
    if (profileSnapshot.interests?.length) {
      setInterests(normalizeArr(profileSnapshot.interests))
    }
    if (profileSnapshot.skills?.length) {
      setSkills(normalizeArr(profileSnapshot.skills))
    }
    if (profileSnapshot.careerGoals) {
      setCareerGoals(profileSnapshot.careerGoals)
    }
  }, [profileSnapshot.interests, profileSnapshot.skills, profileSnapshot.careerGoals])

  const toggleInterest = (option) => {
    setInterests((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
  }

  const toggleSkill = (option) => {
    setSkills((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
  }

  const canContinue = step === 1 ? interests.length > 0 : skills.length > 0

  const handleNext = () => {
    if (!canContinue) {
      addToast?.({
        title: 'Selection required',
        description: step === 1 ? 'Choose at least one interest.' : 'Choose at least one skill.',
        tone: 'warning',
      })
      return
    }
    setStep((prev) => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await post('/api/mentors/ai-match', {
        interests,
        skills,
        careerGoals,
      })
      const data = response?.data ?? response
      setMatches(Array.isArray(data.matches) ? data.matches : [])
      setMentors(Array.isArray(data.mentors) ? data.mentors : [])
      setUserProfile(data.userProfile || null)
      setStep(3)
    } catch (error) {
      console.error('Unable to fetch mentor matches:', error)
      addToast?.({
        title: 'AI match failed',
        description: error.message || 'Gemini was unable to process the request.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-[85vh] rounded-3xl border border-slate-200 p-6 shadow-2xl shadow-slate-200/80 ${gradientBg}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
        >
          ← Back
        </button>
        <header className="space-y-4 text-center text-slate-700">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mentorship • AI powered</p>
          <h1 className="text-4xl font-semibold text-slate-900">Gemini Mentor Match</h1>
          <p className="text-sm text-slate-500">
            We compare your interests, skills, and goals against our mentor community to surface the five mentors most aligned to
            your journey.
          </p>
        </header>

        <StepIndicator current={step} />

        {step === 1 ? (
          <ChipGrid
            title="What are you interested in learning?"
            description="Pick focus areas so we can understand your mentoring needs."
            options={derivedInterests.length ? derivedInterests : ['Career Guidance', 'Placements', 'Higher Studies', 'AI & ML', 'Product Design']}
            selected={interests}
            onToggle={toggleInterest}
            palette={interestPalette}
          />
        ) : null}

        {step === 2 ? (
          <>
            <ChipGrid
              title="Which skills describe you best?"
              description="Highlight your strengths so Gemini can find mentors who complement them."
              options={derivedSkills.length ? derivedSkills : ['React', 'Java', 'Data Science', 'Career Planning', 'Leadership']}
              selected={skills}
              onToggle={toggleSkill}
              palette={skillPalette}
            />
            <section className="space-y-3">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="career-goals">
                Describe your career goals
              </label>
              <textarea
                id="career-goals"
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="E.g., Transition into product management while using my design background to guide strategic decisions."
                className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#4361ee] focus:outline-none"
              />
            </section>
          </>
        ) : null}

        {step === 3 ? (
          <section className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4 text-slate-700">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Top Mentor Suggestions</h2>
                <p className="text-sm text-slate-500">
                  Gemini analyzed your profile and found mentors with the strongest alignment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                Start Over
              </button>
            </header>
            {loading ? (
              <LoadingPulse />
            ) : matches.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard
                    key={match.mentorId}
                    match={match}
                    onViewProfile={() => navigate(`/dashboard/mentors/${match.mentorId}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                <p className="text-sm font-semibold text-slate-600">
                  No AI matches yet. Try adjusting your interests or skills to see different recommendations.
                </p>
              </div>
            )}
          </section>
        ) : null}

        {step < 3 ? (
          <footer className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Step {step} of 3</div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  step === 1
                    ? 'cursor-not-allowed border border-dashed border-slate-300 bg-white text-slate-300'
                    : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                Back
              </button>
              {step === 2 ? (
                <button
                  type="button"
                  onClick={fetchMatches}
                  disabled={loading || !canContinue}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                    loading || !canContinue
                      ? 'cursor-wait border border-dashed border-slate-300 bg-white text-slate-300'
                      : 'bg-gradient-to-r from-[#4361ee] to-[#4cc9f0] text-white hover:from-[#3a56d2] hover:to-[#3db3d8]'
                  }`}
                >
                  {loading ? 'Matching…' : 'Run Gemini Match'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                    canContinue
                      ? 'bg-gradient-to-r from-[#4361ee] to-[#4cc9f0] text-white hover:from-[#3a56d2] hover:to-[#3db3d8]'
                      : 'border border-dashed border-slate-300 bg-white text-slate-300'
                  }`}
                >
                  Continue
                </button>
              )}
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

export default AIMentorMatch
