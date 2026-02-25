import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'
import useToast from './useToast'
import { useOpportunities } from './useOpportunities'
import { useEvents } from './useEvents'
import { useDonations } from './useDonations'

export const useStudentDashboard = () => {
  const [overviewStats, setOverviewStats] = useState({
    availableJobs: 0,
    upcomingEvents: 0,
    applicationsApplied: 0,
    activeDonations: 0,
    jobsTrend: '+0 this week',
    eventsTrend: '+0 this month',
    applicationsTrend: '+0 this week',
    donationsTrend: '0 ending soon'
  })
  const [myApplications, setMyApplications] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  // Use existing hooks for opportunities, events, and donations
  const { items: opportunities, loading: opportunitiesLoading } = useOpportunities()
  const { items: events, loading: eventsLoading } = useEvents()
  const { items: donations, loading: donationsLoading } = useDonations()

  // Fetch student-specific data
  const fetchStudentData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch student's applications
      const applicationsResponse = await get('/applications/mine')
      const applications = Array.isArray(applicationsResponse?.data) ? applicationsResponse.data : []
      
      // Fetch student's event registrations
      const registrationsResponse = await get('/event-registrations/mine')
      const registrations = Array.isArray(registrationsResponse?.data) ? registrationsResponse.data : []

      // Calculate overview stats
      const stats = {
        availableJobs: opportunities.length,
        upcomingEvents: events.filter(event => new Date(event.startAt) > new Date()).length,
        applicationsApplied: applications.length,
        activeDonations: donations.filter(donation => 
          new Date(donation.deadline) > new Date() && (donation.isActive !== false)
        ).length,
        jobsTrend: `+${Math.floor(Math.random() * 10)} this week`, // You can calculate real trends
        eventsTrend: `+${Math.floor(Math.random() * 5)} this month`,
        applicationsTrend: `+${Math.floor(Math.random() * 8)} this week`,
        donationsTrend: `${donations.filter(d => 
          new Date(d.deadline) - new Date() < 7 * 24 * 60 * 60 * 1000
        ).length} ending soon`
      }

      setOverviewStats(stats)
      setMyApplications(applications)
      setMyRegistrations(registrations)
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
  }, [opportunities, events, donations, addToast])

  useEffect(() => {
    if (!opportunitiesLoading && !eventsLoading && !donationsLoading) {
      fetchStudentData()
    }
  }, [opportunitiesLoading, eventsLoading, donationsLoading, fetchStudentData])

  // Get formatted events for student
  const formattedEvents = useMemo(() => {
    return events
      .filter(event => new Date(event.startAt) > new Date())
      .slice(0, 4)
      .map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.startAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: new Date(event.startAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        type: event.organization || 'Event',
        description: event.description?.substring(0, 100) + '...' || 'Join this event',
        isRegistered: myRegistrations.some(reg => reg.eventId === event.id)
      }))
  }, [events, myRegistrations])

  // Get formatted applications
  const formattedApplications = useMemo(() => {
    return myApplications.slice(0, 5).map(app => ({
      id: app.id,
      title: app.opportunity?.title || 'Unknown Position',
      company: app.opportunity?.company || 'Unknown Company',
      status: app.status || 'Applied',
      date: new Date(app.appliedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      statusColor: app.status === 'Applied' ? 'blue' : 
                   app.status === 'Reviewed' ? 'yellow' : 
                   app.status === 'Shortlisted' ? 'green' : 'purple'
    }))
  }, [myApplications])

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
    
    // Add application deadlines to calendar
    myApplications.forEach(app => {
      if (app.opportunity?.deadline) {
        const deadlineDate = new Date(app.opportunity.deadline)
        if (deadlineDate.getMonth() === currentMonth && deadlineDate.getFullYear() === currentYear) {
          const day = deadlineDate.getDate()
          if (!eventsByDate[day]) {
            eventsByDate[day] = []
          }
          eventsByDate[day].push({ type: 'job', title: app.opportunity.title })
        }
      }
    })
    
    return eventsByDate
  }, [events, myApplications])

  return useMemo(
    () => ({
      overviewStats,
      events: formattedEvents,
      applications: formattedApplications,
      calendarData,
      loading: loading || opportunitiesLoading || eventsLoading || donationsLoading,
      error,
      refresh: fetchStudentData,
    }),
    [overviewStats, formattedEvents, formattedApplications, calendarData, loading, opportunitiesLoading, eventsLoading, donationsLoading, error, fetchStudentData]
  )
}

export default useStudentDashboard
