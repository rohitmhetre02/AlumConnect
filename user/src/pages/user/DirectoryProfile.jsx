import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DirectoryProfileView from '../../components/user/directory/DirectoryProfileView'
import { useDirectoryProfile } from '../../hooks/useDirectoryData'

const DirectoryProfile = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()

  const { loading, profile, error } = useDirectoryProfile(profileId)

  const resolvedProfile = useMemo(() => {
    if (!profile) return null
    
    // Transform profile data to match the expected format
    return {
      ...profile,
      // Ensure contact object exists
      contact: {
        email: profile.email,
        phone: profile.phone,
        ...profile.contact
      },
      // Ensure socials object exists
      socials: profile.socials || {},
      // Map badges to certifications for consistency
      certifications: profile.badges || profile.certifications || [],
      // Ensure arrays exist
      experiences: profile.experiences || [],
      education: profile.education || [],
      skills: profile.skills || []
    }
  }, [profile])

  const handleBack = () => {
    const role = profile?.role || 'alumni'
    const targetPath = `/dashboard/directory/${role}`
    navigate(targetPath)
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Unable to load profile</h1>
          <button
            onClick={handleBack}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
          >
            Back to Directory
          </button>
        </div>
        <p className="text-slate-500">{error.message ?? 'Please try again later.'}</p>
      </div>
    )
  }

  if (!resolvedProfile) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Profile Not Found</h1>
          <button
            onClick={handleBack}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
          >
            Back to Directory
          </button>
        </div>
        <p className="text-slate-500">The profile you are looking for does not exist or may have been moved.</p>
      </div>
    )
  }

  return <DirectoryProfileView profile={resolvedProfile} onBack={handleBack} />
}

export default DirectoryProfile
