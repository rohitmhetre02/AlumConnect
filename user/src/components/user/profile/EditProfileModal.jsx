import { useEffect, useState } from 'react'
import Input from '../../forms/Input'
import Textarea from '../../forms/Textarea'
import TagInput from '../../forms/TagInput'
import Modal from '../../ui/Modal'
import FileUpload from '../../common/FileUpload'
import { uploadProfileImage, uploadCoverImage, uploadCertificationFile } from '../../../utils/upload'

const emptyExperience = {
  title: '',
  company: '',
  type: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
}
const emptyEducation = {
  school: '',
  degree: '',
  otherDegree: '',
  field: '',
  department: '',
  admissionYear: '',
  passoutYear: '',
  expectedPassoutYear: '',
  isCurrent: false,
  cgpa: '',
}
const emptyCertification = {
  title: '',
  organization: '',
  location: '',
  date: '',
  file: null,
  fileName: '',
  fileType: '',
}
const defaultForm = {
  firstName: '',
  lastName: '',
  title: '',
  department: '',
  location: '',
  about: '',
  email: '',
  phone: '',
  skills: [],
  badges: [],
  certifications: [],
  avatar: '',
  cover: '',
  linkedin: '',
  github: '',
  instagram: '',
  customSocials: [{ label: '', url: '' }],
  experiences: [],
  education: [],
  admissionYear: '',
  expectedPassoutYear: '',
  passoutYear: '',
}

const employmentTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'other', label: 'Other' },
]

const educationDegrees = [
  'SSC (10th Grade)',
  'HSC (12th Grade)',
  'Undergraduate',
  'Postgraduate',
  "Master's Degree",
  'PhD',
  'Other',
]

const getFieldLabel = (degree) => {
  switch (degree) {
    case 'SSC (10th Grade)':
      return 'Board'
    case 'HSC (12th Grade)':
      return 'Stream'
    case 'Undergraduate':
    case 'Postgraduate':
    case "Master's Degree":
    case 'PhD':
      return 'Field/Department'
    default:
      return 'Field/Department'
  }
}

const getFieldOptions = (degree) => {
  switch (degree) {
    case 'SSC (10th Grade)':
      return ['State Board', 'CBSE', 'ICSE', 'IB', 'Other']
    case 'HSC (12th Grade)':
      return ['Science', 'Commerce', 'Arts', 'Vocational', 'Other']
    case 'Undergraduate':
    case 'Postgraduate':
    case "Master's Degree":
    case 'PhD':
      return [
        'Computer Science',
        'Engineering',
        'Business Administration',
        'Medicine',
        'Arts',
        'Science',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Economics',
        'Psychology',
        'Literature',
        'History',
        'Philosophy',
        'Other'
      ]
    default:
      return ['Other']
  }
}

const getDepartmentOptions = (field) => {
  switch (field) {
    case 'Computer Science':
      return [
        'Artificial Intelligence',
        'Machine Learning',
        'Data Science',
        'Software Engineering',
        'Cybersecurity',
        'Web Development',
        'Mobile Development',
        'Cloud Computing',
        'Database Systems',
        'Computer Networks',
        'Other'
      ]
    case 'Engineering':
      return [
        'Computer Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'Chemical Engineering',
        'Aerospace Engineering',
        'Biomedical Engineering',
        'Environmental Engineering',
        'Industrial Engineering',
        'Materials Engineering',
        'Other'
      ]
    case 'Business Administration':
      return [
        'Finance',
        'Marketing',
        'Human Resources',
        'Operations Management',
        'International Business',
        'Entrepreneurship',
        'Supply Chain Management',
        'Information Systems',
        'Healthcare Management',
        'Hospitality Management',
        'Other'
      ]
    case 'Medicine':
      return [
        'General Medicine',
        'Surgery',
        'Pediatrics',
        'Cardiology',
        'Neurology',
        'Oncology',
        'Psychiatry',
        'Dermatology',
        'Orthopedics',
        'Gynecology',
        'Other'
      ]
    case 'Science':
      return [
        'Physics',
        'Chemistry',
        'Biology',
        'Environmental Science',
        'Biotechnology',
        'Biochemistry',
        'Microbiology',
        'Botany',
        'Zoology',
        'Geology',
        'Other'
      ]
    case 'Mathematics':
      return [
        'Applied Mathematics',
        'Pure Mathematics',
        'Statistics',
        'Actuarial Science',
        'Computational Mathematics',
        'Mathematical Physics',
        'Operations Research',
        'Financial Mathematics',
        'Cryptography',
        'Topology',
        'Other'
      ]
    case 'Arts':
      return [
        'Fine Arts',
        'Performing Arts',
        'Visual Arts',
        'Digital Arts',
        'Graphic Design',
        'Fashion Design',
        'Interior Design',
        'Photography',
        'Sculpture',
        'Music',
        'Other'
      ]
    case 'Economics':
      return [
        'Microeconomics',
        'Macroeconomics',
        'International Economics',
        'Development Economics',
        'Financial Economics',
        'Behavioral Economics',
        'Health Economics',
        'Environmental Economics',
        'Labor Economics',
        'Urban Economics',
        'Other'
      ]
    case 'Psychology':
      return [
        'Clinical Psychology',
        'Counseling Psychology',
        'Educational Psychology',
        'Industrial Psychology',
        'Social Psychology',
        'Developmental Psychology',
        'Cognitive Psychology',
        'Forensic Psychology',
        'Health Psychology',
        'Sports Psychology',
        'Other'
      ]
    case 'Literature':
      return [
        'English Literature',
        'American Literature',
        'World Literature',
        'Comparative Literature',
        'Creative Writing',
        'Journalism',
        'Linguistics',
        'Classical Literature',
        'Modern Literature',
        'Poetry',
        'Other'
      ]
    case 'History':
      return [
        'Ancient History',
        'Medieval History',
        'Modern History',
        'World History',
        'American History',
        'European History',
        'Asian History',
        'Military History',
        'Cultural History',
        'Economic History',
        'Other'
      ]
    case 'Philosophy':
      return [
        'Ethics',
        'Logic',
        'Metaphysics',
        'Epistemology',
        'Political Philosophy',
        'Philosophy of Mind',
        'Philosophy of Science',
        'Aesthetics',
        'Philosophy of Language',
        'Continental Philosophy',
        'Other'
      ]
    default:
      return ['Other']
  }
}

const sectionTitles = {
  summary: 'Edit Profile Summary',
  about: 'Edit About',
  contact: 'Edit Contact Information',
  socials: 'Edit Social Links',
  skills: 'Edit Skills',
  badges: 'Edit Certifications',
  experience: 'Edit Experience',
  education: 'Edit Education',
  cover: 'Change Cover Image',
}

const EditProfileModal = ({ isOpen, onClose, profile, onSave, activeSection = 'summary', role = 'student' }) => {
  const normalizedRole = (role || profile?.raw?.role || 'student').toLowerCase()
  const isStudent = normalizedRole === 'student'
  const isAlumni = normalizedRole === 'alumni'

  const [formState, setFormState] = useState(defaultForm)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar ?? '')
  const [coverPreview, setCoverPreview] = useState(profile?.cover ?? '')

  useEffect(() => {
    if (!isOpen || !profile) return

    switch (activeSection) {
      case 'summary':
        setFormState({
          firstName: profile.raw?.firstName ?? profile.name?.split(' ')?.[0] ?? '',
          lastName: profile.raw?.lastName ?? (profile.name?.split(' ')?.slice(1).join(' ') ?? ''),
          title: profile.title ?? profile.raw?.title ?? '',
          department: profile.department ?? profile.raw?.department ?? '',
          currentYear: profile.currentYear ?? profile.raw?.currentYear ?? '',
          passoutYear: profile.passoutYear ?? profile.raw?.passoutYear ?? '',
        })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      case 'about':
        setFormState({ about: profile.about ?? '' })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      case 'contact': {
        setFormState({
          email: profile.contact?.email ?? '',
          phone: profile.contact?.phone ?? '',
        })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      }
      case 'socials': {
        const socials = Object.entries(profile.socials ?? {}).map(([label, url]) => ({ label, url }))
        setFormState({
          linkedin: profile.socials?.linkedin ?? '',
          github: profile.socials?.github ?? '',
          instagram: profile.socials?.instagram ?? '',
          customSocials: socials.filter(({ label }) => !['linkedin', 'github', 'instagram'].includes(label.toLowerCase())),
        })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      }
      case 'cover':
        setCoverPreview(profile.cover ?? '')
        break
      case 'skills':
        setFormState({ skills: [...(profile.skills ?? [])] })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      case 'badges':
        setFormState({ 
          certifications: [...(profile.certifications ?? [])]
        })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      case 'experience': {
        const experiences = (profile.experiences ?? []).map((item) => ({
          ...emptyExperience,
          ...item,
          isCurrent: Boolean(item?.isCurrent),
        }))
        setFormState({ experiences: experiences.length ? experiences : [{ ...emptyExperience }] })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      }
      case 'education': {
        const education = (profile.education ?? []).map((item) => ({
          ...emptyEducation,
          ...item,
          passoutYear: item.passoutYear ?? item.year ?? '',
          expectedPassoutYear: item.expectedPassoutYear ?? '',
          isCurrent: Boolean(item.isCurrent) || (!(item.passoutYear ?? item.year) && Boolean(item.expectedPassoutYear)),
          cgpa: item.cgpa ?? item.grade ?? '',
        }))
        setFormState({ education: education.length ? education : [{ ...emptyEducation }] })
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
        break
      }
      default:
        setFormState(defaultForm)
        setAvatarPreview(profile.avatar ?? '')
        setCoverPreview(profile.cover ?? '')
    }
  }, [isOpen, profile, activeSection])

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialChange = (index, key, value) => {
    setFormState((prev) => {
      const socials = [...(prev.socials ?? [])]
      socials[index] = { ...socials[index], [key]: value }
      return { ...prev, socials }
    })
  }

  const handleCustomSocialChange = (index, key, value) => {
    setFormState((prev) => {
      const customSocials = [...(prev.customSocials ?? [])]
      customSocials[index] = { ...customSocials[index], [key]: value }
      return { ...prev, customSocials }
    })
  }

  const addCustomSocial = () => {
    setFormState((prev) => ({ ...prev, customSocials: [...(prev.customSocials ?? []), { label: '', url: '' }] }))
  }

  const removeCustomSocial = (index) => {
    setFormState((prev) => {
      const customSocials = [...(prev.customSocials ?? [])]
      customSocials.splice(index, 1)
      return { ...prev, customSocials: customSocials.length ? customSocials : [{ label: '', url: '' }] }
    })
  }

  const handleExperienceChange = (index, key, value) => {
    setFormState((prev) => {
      const experiences = [...(prev.experiences ?? [])]
      experiences[index] = { ...experiences[index], [key]: value }
      return { ...prev, experiences }
    })
  }

  const toggleExperienceCurrent = (index, isCurrent) => {
    setFormState((prev) => {
      const experiences = [...(prev.experiences ?? [])]
      experiences[index] = {
        ...experiences[index],
        isCurrent,
        endDate: isCurrent ? '' : experiences[index].endDate,
      }
      return { ...prev, experiences }
    })
  }

  const handleEducationChange = (index, key, value) => {
    setFormState((prev) => {
      const education = [...(prev.education ?? [])]
      education[index] = { ...education[index], [key]: value }
      return { ...prev, education }
    })
  }

  const toggleEducationCurrent = (index, isCurrent) => {
    setFormState((prev) => {
      const education = [...(prev.education ?? [])]
      const current = { ...education[index], isCurrent }

      if (isCurrent) {
        current.passoutYear = ''
      } else {
        current.expectedPassoutYear = ''
      }

      education[index] = current
      return { ...prev, education }
    })
  }

  const addExperience = () => {
    setFormState((prev) => ({ ...prev, experiences: [...(prev.experiences ?? []), { ...emptyExperience }] }))
  }

  const removeExperience = (index) => {
    setFormState((prev) => {
      const experiences = [...(prev.experiences ?? [])]
      experiences.splice(index, 1)
      return { ...prev, experiences: experiences.length ? experiences : [{ ...emptyExperience }] }
    })
  }

  const addEducation = () => {
    setFormState((prev) => ({ ...prev, education: [...(prev.education ?? []), { ...emptyEducation }] }))
  }

  const removeEducation = (index) => {
    setFormState((prev) => {
      const education = [...(prev.education ?? [])]
      education.splice(index, 1)
      return { ...prev, education: education.length ? education : [{ ...emptyEducation }] }
    })
  }

  const handleCertificationChange = (index, key, value) => {
    setFormState((prev) => {
      const certifications = [...(prev.certifications ?? [])]
      // If array is empty and we're editing index 0, create the first certification
      if (certifications.length === 0 && index === 0) {
        certifications[0] = { ...emptyCertification, [key]: value }
      } else {
        certifications[index] = { ...certifications[index], [key]: value }
      }
      return { ...prev, certifications }
    })
  }

  const handleCertificationFileChange = async (index, file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf')) {
      try {
        const result = await uploadCertificationFile(file)
        setFormState((prev) => {
          const certifications = [...(prev.certifications ?? [])]
          // If array is empty and we're editing index 0, create the first certification
          if (certifications.length === 0 && index === 0) {
            certifications[0] = { 
              ...emptyCertification,
              fileName: result.file_name,
              fileType: result.file_type,
              fileUrl: result.url,
              publicId: result.public_id
            }
          } else {
            certifications[index] = { 
              ...certifications[index], 
              fileName: result.file_name,
              fileType: result.file_type,
              fileUrl: result.url,
              publicId: result.public_id
            }
          }
          return { certifications }
        })
      } catch (error) {
        console.error('Certification upload failed:', error)
      }
    }
  }

  const addCertification = () => {
    setFormState((prev) => ({ ...prev, certifications: [...(prev.certifications ?? []), { ...emptyCertification }] }))
  }

  const removeCertification = (index) => {
    setFormState((prev) => {
      const certifications = [...(prev.certifications ?? [])]
      certifications.splice(index, 1)
      return { ...prev, certifications: certifications.length ? certifications : [{ ...emptyCertification }] }
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    let payload = {}

    switch (activeSection) {
      case 'summary':
        payload = {
          firstName: formState.firstName,
          lastName: formState.lastName,
          title: formState.title,
          department: formState.department,
          avatar: formState.avatar ?? avatarPreview,
        }
        if (isStudent) {
          payload.currentYear = formState.currentYear
        }
        if (isAlumni) {
          payload.passoutYear = formState.passoutYear
        }
        break
      case 'about':
        payload = { about: formState.about }
        break
      case 'contact':
        payload = {
          email: formState.email,
          phone: formState.phone,
        }
        break
      case 'socials': {
        const socials = {}
        if (formState.linkedin) socials.linkedin = formState.linkedin
        if (formState.github) socials.github = formState.github
        if (formState.instagram) socials.instagram = formState.instagram
        ;(formState.customSocials ?? []).forEach(({ label, url }) => {
          if (label && url) {
            socials[label] = url
          }
        })
        payload = { socials }
        break
      }
      case 'cover':
        payload = { cover: coverPreview }
        break
      case 'skills':
        payload = { skills: formState.skills ?? [] }
        break
      case 'badges':
        payload = { 
          certifications: (formState.certifications ?? []).filter(cert => cert.title || cert.organization)
        }
        break
      case 'experience': {
        const experiences = (formState.experiences ?? [])
          .map((item) => ({ ...emptyExperience, ...item }))
          .filter((item) => item.title || item.company || item.description)
        payload = { experiences }
        break
      }
      case 'education': {
        const education = (formState.education ?? [])
          .map((item) => ({
            ...emptyEducation,
            ...item,
            year: item.year ?? (item.isCurrent ? item.expectedPassoutYear : item.passoutYear),
            grade: item.cgpa,
            expectedPassoutYear: item.isCurrent ? item.expectedPassoutYear : '',
            passoutYear: item.isCurrent ? '' : item.passoutYear,
          }))
          .filter((item) => item.school || item.degree || item.passoutYear || item.expectedPassoutYear || item.cgpa)
        payload = { education }
        break
      }
      default:
        payload = formState
    }

    onSave?.(payload)
    onClose?.()
  }

  const renderSection = () => {
    // Faculty should not see skills, badges, or education sections
    if (role === 'faculty' && ['skills', 'badges', 'education'].includes(activeSection)) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-500">This section is not available for faculty profiles.</p>
        </div>
      )
    }

    switch (activeSection) {
      case 'summary':
        return (
          <>
            <div className="space-y-4">
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={avatarPreview || 'https://api.dicebear.com/7.x/initials/svg?seed=Profile'}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full border border-slate-200 object-cover shadow-sm"
                  />
                  <div className="space-y-2">
                    <FileUpload
                      onFileSelect={async (file) => {
                        try {
                          const result = await uploadProfileImage(file)
                          handleChange('avatar', result.url)
                          setAvatarPreview(result.url)
                        } catch (error) {
                          console.error('Upload failed:', error)
                        }
                      }}
                      accept="image/*"
                      className="w-full"
                    >
                      <div className="text-center">
                        <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-slate-600">Upload Profile</p>
                      </div>
                    </FileUpload>
                    <Input
                      label="Or enter URL"
                      value={formState.avatar ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        handleChange('avatar', value)
                        setAvatarPreview(value)
                      }}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="First Name" value={formState.firstName ?? ''} onChange={(e) => handleChange('firstName', e.target.value)} required />
                    <Input label="Last Name" value={formState.lastName ?? ''} onChange={(e) => handleChange('lastName', e.target.value)} />
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Department / Program</span>
                      <select
                        value={formState.department ?? ''}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Arts">Arts</option>
                        <option value="Science">Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Role</span>
                      <select
                        value={formState.title ?? ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select role</option>
                        <option value="Student">Student</option>
                        <option value="Alumni">Alumni</option>
                        <option value="Faculty">Faculty</option>
                      </select>
                    </label>
                    {isStudent ? (
                      <Input label="Current Year" value={formState.currentYear ?? ''} onChange={(e) => handleChange('currentYear', e.target.value)} placeholder="e.g. 1, 2, 3, 4" />
                    ) : null}
                    {isAlumni ? (
                      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        <span>Passout Year</span>
                        <select
                          value={formState.passoutYear ?? ''}
                          onChange={(e) => handleChange('passoutYear', e.target.value)}
                          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select passout year</option>
                          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case 'about':
        return <Textarea label="About" rows={5} value={formState.about ?? ''} onChange={(e) => handleChange('about', e.target.value)} />
      case 'contact':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" value={formState.email ?? ''} onChange={(e) => handleChange('email', e.target.value)} />
              <Input label="Phone" value={formState.phone ?? ''} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
          </div>
        )
      case 'socials':
        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Social Links</p>
            
            <div className="space-y-4">
              <Input
                label="LinkedIn Profile URL"
                value={formState.linkedin ?? ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <Input
                label="GitHub Profile URL"
                value={formState.github ?? ''}
                onChange={(e) => handleChange('github', e.target.value)}
                placeholder="https://github.com/yourusername"
              />
              <Input
                label="Instagram Profile URL"
                value={formState.instagram ?? ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Custom Links</p>
                <button
                  type="button"
                  onClick={addCustomSocial}
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  + Add Custom Link
                </button>
              </div>
              {(formState.customSocials ?? []).map((social, index) => (
                <div key={`custom-social-${index}`} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Platform Name"
                      value={social.label ?? ''}
                      onChange={(e) => handleCustomSocialChange(index, 'label', e.target.value)}
                      placeholder="e.g. Twitter, Website, Portfolio"
                    />
                    <Input
                      label="Profile URL"
                      value={social.url ?? ''}
                      onChange={(e) => handleCustomSocialChange(index, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCustomSocial(index)}
                      className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'cover':
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span>Cover Image</span>
                <FileUpload
                  onFileSelect={async (file) => {
                    try {
                      const result = await uploadCoverImage(file)
                      setCoverPreview(result.url)
                    } catch (error) {
                      console.error('Upload failed:', error)
                    }
                  }}
                  accept="image/*"
                  className="w-full"
                >
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-600">Upload Cover Image</p>
                    <p className="text-xs text-slate-500">Images up to 5MB</p>
                  </div>
                </FileUpload>
              </label>
              {coverPreview && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Preview:</p>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-32 w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )
      case 'skills':
        return <TagInput label="Skills" values={formState.skills ?? []} onChange={(value) => handleChange('skills', value)} />
      case 'badges':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Certifications</p>
              {(formState.certifications ?? []).length > 0 && (formState.certifications[0].title || formState.certifications[0].organization) && (
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  + Add Certification
                </button>
              )}
            </div>
            {(formState.certifications ?? []).length === 0 ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Certification Title"
                    value=""
                    onChange={(e) => handleCertificationChange(0, 'title', e.target.value)}
                    placeholder="e.g. AWS Certified Developer"
                  />
                  <Input
                    label="Organization"
                    value=""
                    onChange={(e) => handleCertificationChange(0, 'organization', e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Location"
                    value=""
                    onChange={(e) => handleCertificationChange(0, 'location', e.target.value)}
                    placeholder="e.g. New York, NY or Online"
                  />
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>Date</span>
                    <input
                      type="month"
                      value=""
                      onChange={(e) => handleCertificationChange(0, 'date', e.target.value)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
                  <div>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Upload Certificate (Image or PDF)</span>
                      <FileUpload
                        onFileSelect={(file) => handleCertificationFileChange(0, file)}
                        accept="image/*,application/pdf"
                        className="w-full"
                      >
                        <div className="text-center">
                          <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-slate-600">Upload Certificate</p>
                        </div>
                      </FileUpload>
                    </label>
                  </div>
              </div>
            ) : (
              (formState.certifications ?? []).map((cert, index) => (
                <div key={`cert-${index}`} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Certification Title"
                      value={cert.title ?? ''}
                      onChange={(e) => handleCertificationChange(index, 'title', e.target.value)}
                      placeholder="e.g. AWS Certified Developer"
                    />
                    <Input
                      label="Organization"
                      value={cert.organization ?? ''}
                      onChange={(e) => handleCertificationChange(index, 'organization', e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Location"
                      value={cert.location ?? ''}
                      onChange={(e) => handleCertificationChange(index, 'location', e.target.value)}
                      placeholder="e.g. New York, NY or Online"
                    />
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Date</span>
                      <input
                        type="month"
                        value={cert.date ?? ''}
                        onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Upload Certificate (Image or PDF)</span>
                      <FileUpload
                        onFileSelect={(file) => handleCertificationFileChange(index, file)}
                        accept="image/*,application/pdf"
                        className="w-full"
                      >
                        <div className="text-center">
                          <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-slate-600">Upload Certificate</p>
                        </div>
                      </FileUpload>
                    </label>
                    {cert.fileName && (
                      <p className="mt-2 text-xs text-slate-500">Selected: {cert.fileName}</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Add Certifications button at the bottom */}
            <div className="pt-4">
              <button
                type="button"
                onClick={addCertification}
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                + Add Certifications
              </button>
            </div>
          </div>
        )
      case 'experience':
        return (
          <div className="space-y-6">
            {(formState.experiences ?? []).map((experience, index) => (
              <div key={`experience-${index}`} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Role Title"
                    value={experience.title ?? ''}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                  />
                  <Input
                    label="Company"
                    value={experience.company ?? ''}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  />
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>Employment Type</span>
                    <select
                      value={experience.type ?? ''}
                      onChange={(e) => handleExperienceChange(index, 'type', e.target.value)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select type</option>
                      {employmentTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-3">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Start Date</span>
                      <input
                        type="month"
                        value={experience.startDate ?? ''}
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={Boolean(experience.isCurrent)}
                        onChange={(e) => toggleExperienceCurrent(index, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      Currently working here
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>End Date</span>
                    <input
                      type="month"
                      value={experience.isCurrent ? '' : experience.endDate ?? ''}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      disabled={Boolean(experience.isCurrent)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </label>
                </div>
                <Textarea
                  label="Description"
                  rows={3}
                  value={experience.description ?? ''}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              + Add experience
            </button>
          </div>
        )
      case 'education':
        return (
          <div className="space-y-6">
            {(formState.education ?? []).map((item, index) => (
              <div key={`education-${index}`} className="space-y-5 rounded-2xl border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Institution"
                    value={item.school ?? ''}
                    onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                  />

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>Degree</span>
                    <select
                      value={item.degree ?? ''}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select degree</option>
                      {educationDegrees.map((degree) => (
                        <option key={degree} value={degree}>
                          {degree}
                        </option>
                      ))}
                    </select>
                  </label>

                  {item.degree === 'Other' && (
                    <Input
                      label="Specify Degree"
                      value={item.otherDegree ?? ''}
                      onChange={(e) => handleEducationChange(index, 'otherDegree', e.target.value)}
                      placeholder="e.g. Diploma, Certificate"
                    />
                  )}

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>{getFieldLabel(item.degree)}</span>
                    <select
                      value={item.field ?? ''}
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select {getFieldLabel(item.degree)}</option>
                      {getFieldOptions(item.degree).map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </label>

                  {item.field && item.field !== 'Other' && (
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Department</span>
                      <select
                        value={item.department ?? ''}
                        onChange={(e) => handleEducationChange(index, 'department', e.target.value)}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select Department</option>
                        {getDepartmentOptions(item.field).map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={Boolean(item.isCurrent)}
                      onChange={(e) => toggleEducationCurrent(index, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                    />
                    Currently pursuing
                  </label>

                  {!item.isCurrent && (
                    <>
                      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        <span>Admission Year</span>
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          value={item.admissionYear ?? ''}
                          onChange={(e) => handleEducationChange(index, 'admissionYear', e.target.value)}
                          placeholder="e.g. 2020"
                          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                        <span>Passout Year</span>
                        <input
                          type="number"
                          min="1900"
                          max="2100"
                          value={item.passoutYear ?? ''}
                          onChange={(e) => handleEducationChange(index, 'passoutYear', e.target.value)}
                          placeholder="e.g. 2024"
                          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </label>
                    </>
                  )}

                  {item.isCurrent && (
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                      <span>Expected Passout Year</span>
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        value={item.expectedPassoutYear ?? ''}
                        onChange={(e) => handleEducationChange(index, 'expectedPassoutYear', e.target.value)}
                        placeholder="e.g. 2025"
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  )}

                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>CGPA / Percentage</span>
                    <input
                      type="text"
                      value={item.cgpa ?? ''}
                      onChange={(e) => handleEducationChange(index, 'cgpa', e.target.value)}
                      placeholder="e.g. 8.7 CGPA or 85%"
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-sm font-semibold text-rose-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              + Add education
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={sectionTitles[activeSection] ?? 'Edit Profile'} width="max-w-2xl">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {renderSection()}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditProfileModal
