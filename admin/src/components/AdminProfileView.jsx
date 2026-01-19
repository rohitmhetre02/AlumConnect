import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import useDirectoryMembers from '../hooks/useDirectoryMembers'

const AdminProfileView = ({ profileId, role, onBack, profileData }) => {
  const { data, isLoading, error } = useDirectoryMembers(role)
  const location = useLocation()

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

    return {
      id: resolvedSource.id || resolvedSource._id || profileId,
      name,
      email,
      phone,
      avatar,
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
    }
  }, [resolvedSource, role, profileId])

  const renderHeader = () => (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary/30 hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to {role === 'students' ? 'Student' : role === 'faculty' ? 'Faculty' : 'Alumni'} Management
        </button>
        <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Admin Panel
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
      <div className="space-y-6">
        {renderHeader()}
        {renderStatusCard('Loading profile details…')}
      </div>
    )
  }

  if (!profile && !profileData && error) {
    return (
      <div className="space-y-6">
        {renderHeader()}
        {renderStatusCard(error?.message || 'Unable to load profile details. Please try again later.', 'error')}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        {renderHeader()}
        {renderStatusCard('Profile details are unavailable for this member.', 'info')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {renderHeader()}

      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-shrink-0">
            {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('/')) ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'grid'
                }}
              />
            ) : null}
            <div
              className={`h-24 w-24 place-items-center rounded-full bg-primary/10 text-2xl font-bold text-primary ${
                profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('/')) ? 'hidden' : 'grid'
              }`}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'M'}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
            <p className="text-slate-600">{profile.department}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>PATH</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-mono lowercase text-slate-500">
                {location.pathname}
              </span>
              <span>ID</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-500">
                {profile.id ?? '—'}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email || 'No email available'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {profile.phone || 'No phone available'}
              </span>
            </div>
            <div className="flex items-center gap-3">
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
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition hover:bg-primary-dark"
                onClick={() => {
                  // Placeholder for message action; integrate messaging modal here
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

      {/* Profile Content */}
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] xl:gap-10">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact Information</h2>
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
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-600">{profile.contact?.address || 'Not available'}</span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Social Profiles</h2>
            </header>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.socials?.linkedin && (
                  <a
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                    aria-label="LinkedIn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {profile.socials?.github && (
                  <a
                    href={profile.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                    aria-label="GitHub"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {profile.socials?.twitter && (
                  <a
                    href={profile.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                    aria-label="Twitter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                )}
              </div>
              {(!profile.socials?.linkedin && !profile.socials?.github && !profile.socials?.twitter) && (
                <span className="text-xs text-slate-400">No social profiles available.</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* About Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</h2>
            </header>
            <div className="mt-4">
              <p className="text-sm leading-6 text-slate-600">{profile.about || 'No information available.'}</p>
            </div>
          </div>

          {/* Experience Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Experience</h2>
            </header>
            <div className="mt-4 space-y-4">
              {profile.experiences?.length ? (
                profile.experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-slate-200 pl-4">
                    <h3 className="text-sm font-semibold text-slate-900">{exp.title}</h3>
                    <p className="text-sm text-slate-600">{exp.company}</p>
                    <p className="text-xs text-slate-500">{exp.period}</p>
                    <p className="mt-2 text-sm text-slate-600">{exp.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No experience information available.</p>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Education</h2>
            </header>
            <div className="mt-4 space-y-4">
              {profile.education?.length ? (
                profile.education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-slate-200 pl-4">
                    <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                    <p className="text-sm text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-500">Class of {edu.year}</p>
                    <p className="mt-2 text-sm text-slate-600">{edu.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No education information available.</p>
              )}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Certifications</h2>
            </header>
            <div className="mt-4 space-y-4">
              {profile.certifications?.length ? (
                profile.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{cert.name}</h3>
                      <p className="text-sm text-slate-600">{cert.issuer}</p>
                      <p className="text-xs text-slate-500">{cert.year ? `Issued ${cert.year}` : 'Issued date not specified'}</p>
                    </div>
                    {cert.status ? (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        cert.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cert.status}
                      </span>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No certifications available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProfileView
