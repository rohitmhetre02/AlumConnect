import { useState } from 'react'
import ToggleSwitch from '../../components/user/settings/ToggleSwitch'
import DangerZone from '../../components/user/settings/DangerZone'
import useToast from '../../hooks/useToast'
import Input from '../../components/forms/Input'

const Settings = () => {
  const [settings, setSettings] = useState({
    publicProfile: true,
    allowMessages: true,
    eventEmails: true,
    jobAlerts: false,
  })
  const [email, setEmail] = useState('contact@example.com')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const addToast = useToast()

  const handleToggle = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleDelete = () => {
    addToast({ type: 'info', message: 'Account deletion requested' })
  }

  const handleEmailUpdate = (event) => {
    event.preventDefault()
    addToast({ type: 'success', message: `Primary email updated to ${email}` })
  }

  const handlePasswordChange = (event) => {
    event.preventDefault()
    if (passwords.next !== passwords.confirm) {
      addToast({ type: 'error', message: 'New passwords do not match' })
      return
    }
    addToast({ type: 'success', message: 'Password updated successfully' })
    setPasswords({ current: '', next: '', confirm: '' })
  }

  const handleForgotPassword = (event) => {
    event.preventDefault()
    if (!recoveryEmail) {
      addToast({ type: 'error', message: 'Enter recovery email' })
      return
    }
    addToast({ type: 'info', message: `Password reset link sent to ${recoveryEmail}` })
    setRecoveryEmail('')
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile visibility, notifications, and security.</p>
      </header>

      <section className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Profile Visibility</h2>
          <div className="mt-4 space-y-4">
            <ToggleSwitch
              label="Show my profile to public"
              checked={settings.publicProfile}
              onChange={(value) => handleToggle('publicProfile', value)}
            />
            <ToggleSwitch
              label="Allow others to message me"
              checked={settings.allowMessages}
              onChange={(value) => handleToggle('allowMessages', value)}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Notifications</h2>
          <div className="mt-4 space-y-4">
            <ToggleSwitch
              label="Email notifications for new events"
              checked={settings.eventEmails}
              onChange={(value) => handleToggle('eventEmails', value)}
            />
            <ToggleSwitch
              label="Job alerts"
              checked={settings.jobAlerts}
              onChange={(value) => handleToggle('jobAlerts', value)}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Account Security</h2>
          <div className="mt-4 space-y-6">
            <form onSubmit={handleEmailUpdate} className="space-y-3">
              <Input label="Primary Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Update Email</button>
            </form>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <Input
                label="Current Password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, next: e.target.value }))}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  required
                />
              </div>
              <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Change Password</button>
            </form>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <Input
                label="Forgot Password"
                type="email"
                placeholder="Enter recovery email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
              />
              <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary">
                Send Reset Link
              </button>
            </form>
          </div>
        </div>

        <DangerZone onDelete={handleDelete} />
      </section>
    </div>
  )
}

export default Settings
