import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, GraduationCap, User } from 'lucide-react'
import { PanelProfile } from './Mentorship'
import MentorDashboard from './MentorPanelDashboard'

const SECTION_ANCHORS = [
  { key: 'profile', label: 'Profile Overview', icon: User, target: 'mentor-panel-profile' },
  { key: 'experience', label: 'Work Experience', icon: Briefcase, target: 'mentor-panel-experience' },
  { key: 'education', label: 'Education Details', icon: GraduationCap, target: 'mentor-panel-education' },
]

const MentorPanel = () => {
  const navigate = useNavigate()

  const handleScroll = useCallback((targetId) => {
    if (typeof document === 'undefined') return
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Mentor Panel</p>
              <h1 className="text-2xl font-bold text-slate-900">Manage Profile</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SECTION_ANCHORS.map(({ key, label, icon: Icon, target }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleScroll(target)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <MentorDashboard />
        <PanelProfile />
      </div>
    </div>
  )
}

export default MentorPanel
