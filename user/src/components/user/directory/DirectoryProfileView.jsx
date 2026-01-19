import React from 'react'
import { Link } from 'react-router-dom'
import ProfileHeader from '../profile/ProfileHeader'
import ProfileOverview from '../profile/ProfileOverview'
import ExperienceList from '../profile/ExperienceList'
import EducationList from '../profile/EducationList'
import BadgesList from '../profile/BadgesList'

const DirectoryProfileView = ({ profile, onBack }) => {
  const role = profile.role || 'alumni'

  return (
    <div className="space-y-10 font-profile">
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
            Back to Directory
          </button>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AlumniConnect
        </div>
      </header>

      <ProfileHeader profile={profile} showConnectButtons={true} />
      
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] xl:gap-10">
        {role === 'faculty' ? (
          // Faculty layout: About in main content, Contact/Socials in sidebar
          <>
            <div className="space-y-6">
              {/* Contact and Socials in sidebar for faculty */}
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

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <header className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Socials</h2>
                  </header>
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.socials?.linkedin ? (
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
                      ) : null}
                      {profile.socials?.github ? (
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
                      ) : null}
                    </div>
                    {Object.keys(profile.socials || {}).length === 0 && (
                      <span className="text-xs text-slate-400">No social profiles available.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* About section before Experience for faculty */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</h2>
                </header>
                <div className="mt-4">
                  <p className="text-sm leading-6 text-slate-600">{profile.about || 'No information available.'}</p>
                </div>
              </div>
              
              <ExperienceList experiences={profile.experiences || []} />
            </div>
          </>
        ) : (
          // Regular layout for alumni and students
          <>
            <ProfileOverview profile={profile} role={role} />
            <div className="space-y-8">
              <ExperienceList experiences={profile.experiences || []} />
              <EducationList education={profile.education || []} />
              <BadgesList certifications={profile.certifications || []} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DirectoryProfileView
