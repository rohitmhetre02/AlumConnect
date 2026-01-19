import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthTemplate from '../components/auth/AuthTemplate'
import { signupRoles } from '../data/authRoles'

const roleIcons = {
  student: (
    <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
      <path
        fill="#FDBA21"
        d="M12 2 3 6l9 4 9-4-9-4Zm7 6.18-7 3.11-7-3.11V10l7 3.11L19 10V8.18ZM17 12.63l-5 2.22-5-2.22v3.26L12 18l5-2.11v-3.26Z"
      />
    </svg>
  ),
  alumni: (
    <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
      <path
        fill="#2563EB"
        d="M12 4a4 4 0 1 1-4 4 4 4 0 0 1 4-4Zm6.5 14.5c0-2.41-3.58-4.5-6.5-4.5s-6.5 2.09-6.5 4.5V20h13Z"
      />
    </svg>
  ),
  faculty: (
    <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
      <path
        fill="#0E9384"
        d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm8 18.5c0-3.08-4.03-5.5-8-5.5s-8 2.42-8 5.5V22h16Z"
      />
    </svg>
  ),
}

const roles = signupRoles.map((role) => ({
  ...role,
  icon: roleIcons[role.id],
}))

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState(roles[0].id)
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate(`/signup/${selectedRole}`)
  }

  return (
    <AuthTemplate
      header={
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-[34px]">Create a new account</h1>
          <p className="text-sm text-slate-500 md:text-base">Join AlumConnect and shape the community alongside peers and mentors.</p>
        </div>
      }
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
            Login
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {roles.map((role) => {
            const isActive = role.id === selectedRole
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`relative flex w-full items-start gap-4 rounded-3xl px-6 py-6 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${role.tone} ${
                  isActive ? 'shadow-[0_18px_46px_rgba(37,99,235,0.16)] ring-2 ring-[#2563EB] bg-white' : 'ring-1 ring-transparent'
                }`}
              >
                <span className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl ${isActive ? 'bg-white shadow-lg' : 'bg-white/70 shadow-md'}`}>
                  {role.icon}
                </span>
                <span className="space-y-2">
                  <span className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900">{role.title}</span>
                    {isActive && (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-white">
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="m5 10 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <p className="text-sm text-slate-500">{role.description}</p>
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Selected role:{' '}
            <span className="font-semibold text-slate-900">
              {roles.find((role) => role.id === selectedRole)?.label ?? 'Student'}
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD]"
            onClick={handleContinue}
          >
            Continue
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </AuthTemplate>
  )
}

export default Signup
