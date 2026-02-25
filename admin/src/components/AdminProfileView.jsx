import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useDirectoryMembers from '../hooks/useDirectoryMembers'

const AdminProfileView = ({ profileId, role, onBack, profileData }) => {
  const { data, isLoading, error } = useDirectoryMembers(role)

  const resolvedSource = useMemo(() => {
    if (profileData) return profileData
    if (!profileId) return null
    const list = Array.isArray(data) ? data : []
    const targetId = String(profileId)

    return (
      list.find((member) => {
        const identifiers = [
          member?.id,
          member?._id,
          member?.userId,
          member?.user?.id,
          member?.user?._id,
        ]
          .filter(Boolean)
          .map(String)

        return identifiers.includes(targetId)
      }) ?? null
    )
  }, [data, profileData, profileId])

  const profile = useMemo(() => {
    if (!resolvedSource) return null

    const firstName = resolvedSource.firstName?.trim() ?? ''
    const lastName = resolvedSource.lastName?.trim() ?? ''
    const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const name = resolvedSource.name?.trim() || combinedName || resolvedSource.email || 'Profile'

    const email =
      resolvedSource.email ||
      resolvedSource.contactEmail ||
      resolvedSource.user?.email ||
      resolvedSource.contact?.email ||
      ''

    const phone =
      resolvedSource.phone ||
      resolvedSource.contactPhone ||
      resolvedSource.contact?.phone ||
      resolvedSource.user?.phone ||
      ''

    const department =
      resolvedSource.department ||
      resolvedSource.program ||
      resolvedSource.specialization ||
      resolvedSource.course ||
      resolvedSource.title ||
      '—'

    const rawStatus =
      resolvedSource.status || (resolvedSource.active === false ? 'Inactive' : 'Active')
    const status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : 'Active'

    const yearValue =
      resolvedSource.year ||
      resolvedSource.passoutYear ||
      resolvedSource.graduationYear ||
      resolvedSource.classYear ||
      resolvedSource.currentYear ||
      resolvedSource.joinYear ||
      resolvedSource.joiningYear ||
      ''

    const year = yearValue ? String(yearValue) : ''
    const timelineLabel = year
      ? role === 'students'
        ? `Class of ${year}`
        : role === 'faculty'
          ? `Since ${year}`
          : `Graduated ${year}`
      : ''

    const about =
      resolvedSource.about ||
      resolvedSource.bio ||
      resolvedSource.summary ||
      resolvedSource.description ||
      ''

    const contact = {
      email,
      phone,
      address:
        resolvedSource.address ||
        resolvedSource.contactAddress ||
        resolvedSource.contact?.address ||
        resolvedSource.user?.address ||
        '',
    }

    const socials = {
      linkedin:
        resolvedSource.socials?.linkedin ||
        resolvedSource.linkedin ||
        resolvedSource.linkedinProfile ||
        '',
      github:
        resolvedSource.socials?.github || resolvedSource.github || resolvedSource.githubProfile || '',
      twitter:
        resolvedSource.socials?.twitter ||
        resolvedSource.twitter ||
        resolvedSource.twitterProfile ||
        resolvedSource.xHandle ||
        '',
    }

    const experiencesSource = Array.isArray(resolvedSource.experiences)
      ? resolvedSource.experiences
      : Array.isArray(resolvedSource.experience)
        ? resolvedSource.experience
        : []

    const experiences = experiencesSource
      .map((exp, index) => ({
        id: exp?.id || exp?._id || `${index}`,
        title: exp?.title || exp?.role || exp?.position || 'Experience',
        company: exp?.company || exp?.organization || exp?.institution || '—',
        period: exp?.period || exp?.duration || exp?.dates || '',
        description: exp?.description || exp?.summary || '',
      }))
      .filter((exp) => Boolean(exp.title) || Boolean(exp.company))

    const educationSource = Array.isArray(resolvedSource.education)
      ? resolvedSource.education
      : []

    const education = educationSource
      .map((edu, index) => ({
        id: edu?.id || edu?._id || `${index}`,
        degree: edu?.degree || edu?.qualification || edu?.course || 'Education',
        institution: edu?.institution || edu?.school || edu?.college || '—',
        year: edu?.year || edu?.graduationYear || edu?.completionYear || '',
        description: edu?.description || edu?.summary || '',
      }))
      .filter((edu) => Boolean(edu.degree) || Boolean(edu.institution))

    const certificationsSource = Array.isArray(resolvedSource.certifications)
      ? resolvedSource.certifications
      : []

    const certifications = certificationsSource
      .map((cert, index) => ({
        id: cert?.id || cert?._id || `${index}`,
        name: cert?.name || cert?.title || 'Certification',
        issuer: cert?.issuer || cert?.organization || '—',
        year: cert?.year || cert?.issuedYear || cert?.date || '',
        status: cert?.status || cert?.state || '',
      }))
      .filter((cert) => Boolean(cert.name))

    const avatar =
      resolvedSource.avatar ||
      resolvedSource.profilePicture ||
      resolvedSource.photo ||
      resolvedSource.image ||
      resolvedSource.picture ||
      ''

    const cover =
      resolvedSource.cover ||
      resolvedSource.coverImage ||
      resolvedSource.banner ||
      ''

    const skills = Array.isArray(resolvedSource.skills) ? resolvedSource.skills : []

    return {
      id: resolvedSource.id || resolvedSource._id || profileId,
      name,
      email,
      phone,
      avatar,
      cover,
      department,
      status,
      year,
      timelineLabel,
      about,
      contact,
      socials,
      experiences,
      education,
      certifications,
      skills,
    }
  }, [resolvedSource, role, profileId])

  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h14" />
            </svg>
            Back to {role === 'students' ? 'Student' : role === 'faculty' ? 'Faculty' : 'Alumni'} Management
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Profile Details</span>
            <span className="text-xs font-medium text-slate-400">•</span>
            <span className="text-xs font-medium text-primary">{role === 'students' ? 'Student' : role === 'faculty' ? 'Faculty' : 'Alumni'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Admin Panel</span>
        </div>
      </div>
    </header>
  )

  const renderStatusCard = (message, tone = 'info') => {
    const toneClasses = {
      info: 'border-slate-200 bg-white text-slate-500',
      error: 'border-red-200 bg-red-50 text-red-600',
    }

    return (
      <div className={`rounded-2xl border p-6 text-sm ${toneClasses[tone] ?? toneClasses.info}`}>
        {message}
      </div>
    )
  }

  if (!profile && !profileData && isLoading) {
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
        {renderStatusCard('Loading profile details…')}
      </div>
    )
  }

  if (!profile && !profileData && error) {
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
        {renderStatusCard(error?.message || 'Unable to load profile details. Please try again later.', 'error')}
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
        {renderStatusCard('Profile details are unavailable for this member.', 'info')}
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
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'M'}
              </div>
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-slate-600">{profile.department}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {profile.status}
                </span>
                {profile.timelineLabel ? (
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {profile.timelineLabel}
                  </span>
                ) : null}
              </div>
            </div>
            
            <div className="flex gap-2 pb-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition hover:bg-primary-dark"
                onClick={() => {
                  console.info('AdminProfileView: Message button clicked for', profile.id)
                }}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Message
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
          {/* Personal Details Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Personal Details</h2>
              <span className="text-xs font-medium text-slate-500">Basic Information</span>
            </header>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{profile.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm text-slate-900 mt-1">{profile.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm text-slate-900 mt-1">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Department</p>
                  <p className="text-sm text-slate-900 mt-1">{profile.department || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold mt-1 ${
                    profile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</p>
                  <p className="text-sm text-slate-900 mt-1">{profile.timelineLabel || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          {profile.about && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">About</h2>
                <span className="text-xs font-medium text-slate-500">Personal Information</span>
              </header>
              <div className="mt-6">
                <p className="text-base text-slate-700 leading-relaxed">{profile.about}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
              <span className="text-xs font-medium text-slate-500">Reach Out</span>
            </header>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-sm text-slate-900 hover:text-primary mt-1 inline-block">
                    {profile.email || 'Not provided'}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</p>
                  <a href={`tel:${profile.phone}`} className="text-sm text-slate-900 hover:text-primary mt-1 inline-block">
                    {profile.phone || 'Not provided'}
                  </a>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address</p>
                  <p className="text-sm text-slate-900 mt-1">{profile.contact?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          {profile.experiences.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Professional Experience</h2>
                <span className="text-xs font-medium text-slate-500">{profile.experiences.length} positions</span>
              </header>
              <div className="mt-6 space-y-4">
                {profile.experiences.map((exp, index) => (
                  <div key={exp.id} className="pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">{exp.title || 'Position'}</h3>
                        <p className="text-sm text-slate-500">{exp.company || 'Organization'}</p>
                        <p className="text-xs text-slate-400">{exp.period || 'Duration'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">{exp.description || 'Description not available'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Education</h2>
                <span className="text-xs font-medium text-slate-500">{profile.education.length} degrees</span>
              </header>
              <div className="mt-6 space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={edu.id} className="pb-4 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">{edu.degree || 'Degree'}</h3>
                        <p className="text-sm text-slate-500">{edu.institution || 'Institution'}</p>
                        <p className="text-xs text-slate-400">{edu.year || 'Year'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">{edu.description || 'Description not available'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {profile.certifications.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Certifications</h2>
                <span className="text-xs font-medium text-slate-500">{profile.certifications.length} certifications</span>
              </header>
              <div className="mt-6 space-y-3">
                {profile.certifications.map((cert, index) => (
                  <div key={cert.id} className="pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">{cert.name || 'Certificate'}</h3>
                        <p className="text-sm text-slate-500">{cert.issuer || 'Issuer'}</p>
                        <p className="text-xs text-slate-400">{cert.year || 'Year'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          cert.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
                <span className="text-xs font-medium text-slate-500">{profile.skills.length} skills</span>
              </header>
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProfileView
