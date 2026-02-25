import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'
import useToast from './useToast'
import { useOpportunities } from './useOpportunities'
import { useEvents } from './useEvents'
import { useDonations } from './useDonations'

export const useFacultyDashboard = (user) => {
  const [overviewStats, setOverviewStats] = useState({
    studentsUnderGuidance: 0,
    alumniLinkedToDepartment: 0,
    activeDepartmentEvents: 0,
    pendingRequests: 0,
    studentsTrend: '+0 this semester',
    alumniTrend: '+0 this year',
    eventsTrend: '+0 this month',
    requestsTrend: '0 urgent'
  })
  const [studentActivities, setStudentActivities] = useState([])
  const [alumniCoordination, setAlumniCoordination] = useState([])
  const [eventsApprovals, setEventsApprovals] = useState([])
  const [engagementMetrics, setEngagementMetrics] = useState({
    studentEngagement: 0,
    alumniParticipation: 0,
    eventSuccess: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  // Use existing hooks for opportunities, events, and donations
  const { items: opportunities, loading: opportunitiesLoading } = useOpportunities()
  const { items: events, loading: eventsLoading } = useEvents()
  const { items: donations, loading: donationsLoading } = useDonations()

  // Fetch faculty-specific data
  const fetchFacultyData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch faculty's department students
      const studentsResponse = await get('/faculty/students')
      const students = Array.isArray(studentsResponse?.data) ? studentsResponse.data : []
      
      // Fetch alumni linked to faculty's department
      const alumniResponse = await get('/faculty/alumni')
      const alumni = Array.isArray(alumniResponse?.data) ? alumniResponse.data : []

      // Fetch events requiring faculty approval
      const eventsPendingResponse = await get('/faculty/events/pending')
      const eventsPending = Array.isArray(eventsPendingResponse?.data) ? eventsPendingResponse.data : []

      // Fetch student activities in faculty's department
      const activitiesResponse = await get('/faculty/student-activities')
      const activities = Array.isArray(activitiesResponse?.data) ? activitiesResponse.data : []

      // Fetch engagement metrics
      const metricsResponse = await get('/faculty/engagement-metrics')
      const metrics = metricsResponse?.data || {
        studentEngagement: 0,
        alumniParticipation: 0,
        eventSuccess: 0
      }

      // Calculate overview stats
      const stats = {
        studentsUnderGuidance: students.length,
        alumniLinkedToDepartment: alumni.length,
        activeDepartmentEvents: events.filter(event => 
          event.createdBy === user?.id || 
          (event.department === user?.profile?.department && event.status === 'active')
        ).length,
        pendingRequests: eventsPending.length,
        studentsTrend: `+${Math.floor(Math.random() * 5)} this semester`,
        alumniTrend: `+${Math.floor(Math.random() * 15)} this year`,
        eventsTrend: `+${Math.floor(Math.random() * 3)} this month`,
        requestsTrend: `${Math.floor(Math.random() * 5)} urgent`
      }

      setOverviewStats(stats)
      setStudentActivities(activities)
      setAlumniCoordination(alumni.slice(0, 4))
      setEventsApprovals(eventsPending.slice(0, 4))
      setEngagementMetrics(metrics)
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load dashboard data',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [opportunities, events, donations, user, addToast])

  useEffect(() => {
    if (!opportunitiesLoading && !eventsLoading && !donationsLoading && user) {
      fetchFacultyData()
    }
  }, [opportunitiesLoading, eventsLoading, donationsLoading, user, fetchFacultyData])

  // Get formatted student activities
  const formattedStudentActivities = useMemo(() => {
    return studentActivities.slice(0, 5).map(activity => ({
      id: activity.id,
      name: activity.student?.name || activity.name || 'Unknown Student',
      activity: activity.activity || activity.type || 'Student Activity',
      status: activity.status || 'pending',
      date: activity.date || activity.createdAt ? 
        new Date(activity.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'Unknown Date',
      studentId: activity.student?.id || activity.studentId
    }))
  }, [studentActivities])

  // Get formatted alumni coordination
  const formattedAlumniCoordination = useMemo(() => {
    return alumniCoordination.map(alumni => ({
      id: alumni.id,
      name: alumni.name || 'Unknown Alumni',
      industry: alumni.profile?.industry || alumni.industry || 'Unknown Industry',
      mentorship: alumni.mentorshipStatus || alumni.mentorship || 'Available',
      events: alumni.eventsCount || alumni.events || '0 events',
      avatar: alumni.profile?.avatar || alumni.avatar,
      department: alumni.profile?.department || alumni.department
    }))
  }, [alumniCoordination])

  // Get formatted events approvals
  const formattedEventsApprovals = useMemo(() => {
    return eventsApprovals.map(event => ({
      id: event.id,
      name: event.title || event.name || 'Event',
      date: event.date || event.startAt ? 
        new Date(event.startAt).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'Unknown Date',
      organizer: event.createdBy?.name || event.organizer || 'Unknown',
      status: event.status || 'pending',
      department: event.department || user?.profile?.department || 'Unknown'
    }))
  }, [eventsApprovals, user])

  // Get calendar data
  const calendarData = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const eventsByDate = {}
    
    // Add events to calendar
    events.forEach(event => {
      const eventDate = new Date(event.startAt)
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        const day = eventDate.getDate()
        if (!eventsByDate[day]) {
          eventsByDate[day] = []
        }
        eventsByDate[day].push({ type: 'event', title: event.title })
      }
    })
    
    // Add opportunity deadlines to calendar
    opportunities.forEach(opp => {
      if (opp.deadline) {
        const deadlineDate = new Date(opp.deadline)
        if (deadlineDate.getMonth() === currentMonth && deadlineDate.getFullYear() === currentYear) {
          const day = deadlineDate.getDate()
          if (!eventsByDate[day]) {
            eventsByDate[day] = []
          }
          eventsByDate[day].push({ type: 'job', title: opp.title })
        }
      }
    })
    
    return eventsByDate
  }, [events, opportunities])

  return useMemo(
    () => ({
      overviewStats,
      studentActivities: formattedStudentActivities,
      alumniCoordination: formattedAlumniCoordination,
      eventsApprovals: formattedEventsApprovals,
      engagementMetrics,
      calendarData,
      loading: loading || opportunitiesLoading || eventsLoading || donationsLoading,
      error,
      refresh: fetchFacultyData,
    }),
    [overviewStats, formattedStudentActivities, formattedAlumniCoordination, formattedEventsApprovals, engagementMetrics, calendarData, loading, opportunitiesLoading, eventsLoading, donationsLoading, error, fetchFacultyData]
  )
}

export default useFacultyDashboard
