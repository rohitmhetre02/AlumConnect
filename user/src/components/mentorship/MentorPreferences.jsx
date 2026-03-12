import { useState, useEffect } from 'react'
import { get, post } from '../../utils/api'
import useToast from '../../hooks/useToast'

const MentorPreferences = ({ onPreferencesChange }) => {
  const [preferences, setPreferences] = useState({
    careerInterest: '',
    skills: [],
    preferredIndustry: '',
    preferredExperience: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  // Load existing preferences on component mount
  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const response = await get('/students/preferences')
      if (response.preferences) {
        setPreferences(response.preferences)
        onPreferencesChange(response.preferences)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      // Don't show error toast on initial load, as preferences might not exist yet
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field) => (e) => {
    const value = e.target.value
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillAdd = () => {
    if (skillInput.trim() && preferences.skills.length < 10) {
      const newSkills = [...preferences.skills, skillInput.trim()]
      setPreferences(prev => ({
        ...prev,
        skills: newSkills
      }))
      setSkillInput('')
    }
  }

  const handleSkillRemove = (skillToRemove) => {
    setPreferences(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSkillAdd()
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      await post('/students/preferences', preferences)
      
      toast({
        title: 'Preferences Saved',
        description: 'Your mentor preferences have been updated successfully.',
        tone: 'success'
      })
      
      onPreferencesChange(preferences)
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        tone: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const careerOptions = [
    'Software Development',
    'Data Science',
    'Product Management',
    'UI/UX Design',
    'Digital Marketing',
    'Business Development',
    'Consulting',
    'Research & Development',
    'Entrepreneurship',
    'Other'
  ]

  const industryOptions = [
    'IT / Software',
    'Core Engineering',
    'Management',
    'Government',
    'Startup',
    'Research / Academia',
    'Finance',
    'Healthcare',
    'E-commerce',
    'Other'
  ]

  const experienceOptions = [
    '0-2 years',
    '3-5 years',
    '6-10 years',
    '11-15 years',
    '16+ years'
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w- h-8 bg-blue-600 rounded-full"></span>
          Your Mentor Preferences
        </h2>
        <p className="text-slate-600 mt-2">Tell us what you're looking for in a mentor to get personalized recommendations</p>
      </div>

      <div className="space-y-6">
        {/* Career Interest */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Career Interest *
          </label>
          <select
            value={preferences.careerInterest}
            onChange={handleInputChange('careerInterest')}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select your career interest</option>
            {careerOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Skills You Want to Learn *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Add a skill (e.g., React, Python, Leadership)..."
              disabled={preferences.skills.length >= 10}
            />
            <button
              type="button"
              onClick={handleSkillAdd}
              disabled={preferences.skills.length >= 10 || !skillInput.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferences.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleSkillRemove(skill)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-slate-500">{preferences.skills.length}/10 skills added</p>
            {preferences.skills.length >= 10 && (
              <p className="text-xs text-amber-600">Maximum 10 skills reached</p>
            )}
          </div>
        </div>

        {/* Preferred Industry */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Preferred Industry *
          </label>
          <select
            value={preferences.preferredIndustry}
            onChange={handleInputChange('preferredIndustry')}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select preferred industry</option>
            {industryOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Preferred Experience */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Preferred Mentor Experience *
          </label>
          <select
            value={preferences.preferredExperience}
            onChange={handleInputChange('preferredExperience')}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select preferred experience level</option>
            {experienceOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={saving || !preferences.careerInterest || preferences.skills.length === 0 || !preferences.preferredIndustry || !preferences.preferredExperience}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Apply Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MentorPreferences
