import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../utils/api'

const AdminProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const emptyProfile = {
    name: '',
    title: '',
    location: '',
    cover: '',
    avatar: '',
    about: '',
    contact: { email: '', phone: '' },
    socials: {},
    skills: [],
    certifications: [],
    experiences: [],
    education: [],
    stats: { connections: 0, mentorships: 0, views: 0 },
  }

  const normalizeSocials = (socials) => {
    if (!socials) return {}
    if (socials instanceof Map) {
      return Object.fromEntries(socials.entries())
    }
    if (typeof socials === 'object') return { ...socials }
    return {}
  }

  const ensureArray = (value) => {
    if (!value) return []
    return Array.isArray(value) ? value : [value].filter(Boolean)
  }

  const formatProfile = (user = {}) => {
    const firstName = user.firstName ?? ''
    const lastName = user.lastName ?? ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const contact = {
      email: user.email ?? '',
      phone: user.phone ?? '',
    }

    return {
      ...emptyProfile,
      name: fullName || user.name || 'Administrator',
      title: user.title || 'System Administrator',
      location: user.location ?? '',
      avatar: user.avatar ?? '',
      cover: user.cover ?? '',
      about: user.about || 'System administrator managing the AlumniConnect platform.',
      skills: ensureArray(user.skills),
      certifications: ensureArray(user.certifications),
      contact,
      socials: normalizeSocials(user.socials),
      experiences: ensureArray(user.experiences),
      education: ensureArray(user.education),
      stats: {
        connections: Number(user?.stats?.connections ?? 0),
        mentorships: Number(user?.stats?.mentorships ?? 0),
        views: Number(user?.stats?.views ?? 0),
      },
      raw: {
        ...user,
        role: user.role,
      },
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get('/auth/profile/me')
      const formatted = formatProfile(response.data)
      setProfile(formatted)
    } catch (error) {
      console.error('Failed to fetch admin profile:', error)
      setError(error?.message || 'Unable to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="space-y-10 font-profile">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary/30 hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Admin Panel
          </div>
        </header>
        
        <div className="grid gap-6">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-[35%_1fr]">
            <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
              <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-10 font-profile">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary/30 hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Admin Panel
          </div>
        </header>
        
        <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Profile unavailable</h2>
          <p className="mt-3 text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-10 font-profile">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary/30 hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Admin Panel
          </div>
        </header>
        
        <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Profile unavailable</h2>
          <p className="mt-3 text-sm text-slate-500">We couldn't load your profile details. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 font-profile">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Admin Panel
        </div>
      </header>

      {/* Profile Header with Cover */}
      <div className="relative">
        <div className="h-56 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10">
          {profile.cover && (profile.cover.startsWith('http') || profile.cover.startsWith('/')) ? (
            <img
              src={profile.cover}
              alt="Cover"
              className="h-full w-full rounded-2xl object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : null}
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end gap-6 -mt-12">
            <div className="flex-shrink-0">
              {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('/')) ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextElementSibling.style.display = 'grid'
                  }}
                />
              ) : null}
              <div
                className={`h-24 w-24 place-items-center rounded-full border-4 border-white bg-primary/10 text-2xl font-bold text-primary shadow-lg ${
                  profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('/')) ? 'hidden' : 'grid'
                }`}
              >
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-slate-600">{profile.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  Administrator
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 pb-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition hover:bg-primary-dark"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid - Sidebar and Main */}
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] xl:gap-10">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h2>
            </header>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-600">{profile.contact?.email || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-600">{profile.contact?.phone || 'Not available'}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Skills</h2>
              </header>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</h2>
            </header>
            <div className="mt-4">
              <p className="text-sm leading-6 text-slate-600">{profile.about}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfile
