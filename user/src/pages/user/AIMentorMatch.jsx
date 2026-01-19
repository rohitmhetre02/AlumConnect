import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { post } from '../../utils/api'
import useToast from '../../hooks/useToast'
import MentorCard from '../../components/user/mentorship/MentorCard'

const STEP_LABELS = ['Select Interests', 'Select Skills', 'Review Matches']

const gradientBg = 'bg-gradient-to-br from-[#eef2ff] via-[#fafaff] to-[#ffffff]'

const interestPalette = [
  '#FF8A80',
  '#FF80AB',
  '#B388FF',
  '#8C9EFF',
  '#80D8FF',
  '#A7FFEB',
  '#CCFF90',
  '#FFE082',
  '#FFAB91',
  '#CFD8DC',
]

const skillPalette = [
  '#4FC3F7',
  '#4DB6AC',
  '#81C784',
  '#AED581',
  '#FFD54F',
  '#FF8A65',
  '#BA68C8',
  '#9575CD',
  '#7986CB',
  '#64B5F6',
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
