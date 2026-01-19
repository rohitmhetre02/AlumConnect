import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState({
    siteName: 'AlumConnect Admin',
    siteEmail: 'admin@alumconnect.com',
    maintenance: false,
    notifications: true,
    analytics: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    itemsPerPage: '10',
    autoSave: true,
    sessionTimeout: '30',
    twoFactorAuth: false,
    ipWhitelist: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        if (response.success && response.data) {
          setFormData(prev => ({ ...prev, ...response.data }))
        }
      } catch (err) {
        setError('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    try {
      const response = await api.put('/settings', formData)
      if (response.success) {
        alert('Settings saved successfully!')
      } else {
        setError(response.message || 'Failed to save settings')
      }
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage admin panel configuration and preferences.</p>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-soft">
        <div className="border-b border-slate-100">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading settings…</div>
          ) : (
            <>
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">General Settings</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                        <input
                          type="text"
                          value={formData.siteName}
                          onChange={(e) => handleInputChange('siteName', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                        <input
                          type="email"
                          value={formData.siteEmail}
                          onChange={(e) => handleInputChange('siteEmail', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                        <select
                          value={formData.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">EST</option>
                          <option value="PST">PST</option>
                          <option value="IST">IST</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                        <select
                          value={formData.dateFormat}
                          onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">Maintenance Mode</div>
                          <div className="text-sm text-slate-500">Temporarily disable public access</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('maintenance', !formData.maintenance)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            formData.maintenance ? 'bg-red-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              formData.maintenance ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                        <select
                          value={formData.sessionTimeout}
                          onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-900">Two-Factor Authentication</div>
                            <div className="text-sm text-slate-500">Require 2FA for admin accounts</div>
                          </div>
                          <button
                            onClick={() => handleInputChange('twoFactorAuth', !formData.twoFactorAuth)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              formData.twoFactorAuth ? 'bg-red-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                formData.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-900">IP Whitelist</div>
                            <div className="text-sm text-slate-500">Restrict access to specific IPs</div>
                          </div>
                          <button
                            onClick={() => handleInputChange('ipWhitelist', !formData.ipWhitelist)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              formData.ipWhitelist ? 'bg-red-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                formData.ipWhitelist ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">Email Notifications</div>
                          <div className="text-sm text-slate-500">Receive email alerts for important events</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('notifications', !formData.notifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            formData.notifications ? 'bg-red-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              formData.notifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">Analytics Reports</div>
                          <div className="text-sm text-slate-500">Weekly analytics and performance reports</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('analytics', !formData.analytics)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            formData.analytics ? 'bg-red-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              formData.analytics ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Appearance Settings</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                        <select
                          value={formData.theme}
                          onChange={(e) => handleInputChange('theme', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                        <select
                          value={formData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Advanced Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Items Per Page</label>
                        <select
                          value={formData.itemsPerPage}
                          onChange={(e) => handleInputChange('itemsPerPage', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-slate-900">Auto-save</div>
                          <div className="text-sm text-slate-500">Automatically save form data</div>
                        </div>
                        <button
                          onClick={() => handleInputChange('autoSave', !formData.autoSave)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            formData.autoSave ? 'bg-red-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              formData.autoSave ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Settings
