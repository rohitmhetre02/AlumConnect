import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'
import useToast from './useToast'

const normalizeArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const normalizeExperience = (items) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    company: item.company || '',
    role: item.role || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    isCurrentJob: Boolean(item.isCurrentJob),
    description: item.description || '',
  }))
}

const normalizeEducation = (items) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    institution: item.institution || '',
    degree: item.degree || '',
    field: item.field || '',
    department: item.department || '',
    admissionYear: item.admissionYear || '',
    passoutYear: item.passoutYear || '',
    cgpa: item.cgpa || '',
    isCurrentlyPursuing: Boolean(item.isCurrentlyPursuing),
    description: item.description || '',
  }))
}

const normalizeServices = (items) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    id: item.id || item._id || '',
    title: item.title || '',
    description: item.description || '',
    duration: item.duration || '',
    price: typeof item.price === 'number' ? item.price : Number(item.price ?? 0),
    mode: item.mode || '',
    status: item.status || 'inactive',
  }))
}

const normalizeResources = (items) => {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    id: item.id || item._id || '',
    title: item.title || '',
    description: item.description || '',
    type: item.type || 'other',
    status: item.status || 'inactive',
    url: item.url || '',
    fileName: item.fileName || '',
    fileType: item.fileType || '',
    fileSize: item.fileSize ?? 0,
  }))
}

const normalizeMentor = (mentor = {}) => {
  if (!mentor) return null

  return {
    id: mentor.id || mentor.applicationId || mentor.profileId || '',
    slug: mentor.slug || '',
    fullName: mentor.fullName || mentor.name || '',
    email: mentor.email || '',
    contactNumber: mentor.contactNumber || '',
    graduationYear: mentor.graduationYear || '',
    department: mentor.department || '',
    location: mentor.location || '',
    linkedin: mentor.linkedin || '',
    jobRole: mentor.jobRole || mentor.position || '',
    companyName: mentor.companyName || '',
    industry: mentor.industry || '',
    experience: mentor.experience || '',
    preferredStudents: mentor.preferredStudents || '',
    maxStudents: mentor.maxStudents || '',
    weeklyHours: mentor.weeklyHours || '',
    availability: mentor.availability || '',
    modes: normalizeArray(mentor.modes),
    categories: normalizeArray(mentor.categories),
    expertise: normalizeArray(mentor.expertise),
    skills: mentor.skills || '',
    bio: mentor.bio || '',
    motivation: mentor.motivation || '',
    avatar: mentor.avatar || '',
    services: normalizeServices(mentor.services),
    resources: normalizeResources(mentor.resources),
    workExperience: normalizeExperience(mentor.workExperience),
    education: normalizeEducation(mentor.education),
    createdAt: mentor.createdAt ? new Date(mentor.createdAt) : null,
    updatedAt: mentor.updatedAt ? new Date(mentor.updatedAt) : null,
  }
}

export const useMentorDetails = (mentorId) => {
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchMentor = useCallback(async () => {
    if (!mentorId) {
      setMentor(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await get(`/api/mentors/${mentorId}`)
      const data = response?.data ?? response
      setMentor(normalizeMentor(data))
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load mentor profile',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [mentorId, toast])

  useEffect(() => {
    fetchMentor()
  }, [fetchMentor])

  return useMemo(
    () => ({ mentor, loading, error, refresh: fetchMentor }),
    [mentor, loading, error, fetchMentor],
  )
}

export default useMentorDetails
