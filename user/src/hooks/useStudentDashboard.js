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
  const [myDonations, setMyDonations] = useState([])
  const [myMentorshipRequests, setMyMentorshipRequests] = useState([])
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
      const registrationsResponse = await get('/events/registrations/me')
      const registrations = Array.isArray(registrationsResponse?.data) ? registrationsResponse.data : []

      // Fetch student's donations (using correct endpoint)
      const donationsResponse = await get('/campaigns/donations/user')
      const donations = Array.isArray(donationsResponse?.data) ? donationsResponse.data : []

      // Fetch student's mentorship requests (using correct endpoint)
      const mentorshipResponse = await get('/mentors/me/requests')
      const mentorshipRequests = Array.isArray(mentorshipResponse?.data) ? mentorshipResponse.data : []

      // Calculate overview stats
      const upcomingEvents = events.filter(event => {
        // Try multiple date fields and handle invalid dates
        let eventDate = null
        
        if (event.startAt) {
          eventDate = new Date(event.startAt)
        } else if (event.date) {
          eventDate = new Date(event.date)
        } else if (event.createdAt) {
          eventDate = new Date(event.createdAt)
        }
        
        // If no valid date found, don't include the event
        if (!eventDate || isNaN(eventDate.getTime())) {
          return false
        }
        
        // Check if event is in the future (more than 1 hour from now)
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
        return eventDate > oneHourFromNow
      })
      
      const activeDonations = donations.filter(donation => {
        if (!donation.deadline) return false
        const deadlineDate = new Date(donation.deadline)
        return !isNaN(deadlineDate.getTime()) && deadlineDate > new Date() && (donation.isActive !== false)
      })
      
      const stats = {
        availableJobs: opportunities.length,
        upcomingEvents: upcomingEvents.length,
        applicationsApplied: applications.length,
        activeDonations: activeDonations.length,
        jobsTrend: opportunities.length > 0 ? 'Available now' : 'No opportunities',
        eventsTrend: upcomingEvents.length > 0 ? `${upcomingEvents.length} scheduled` : 'No events',
        applicationsTrend: applications.length > 0 ? `${applications.length} submitted` : 'No applications',
        donationsTrend: activeDonations.length > 0 ? `${activeDonations.length} active` : 'No campaigns'
      }

      setOverviewStats(stats)
      setMyApplications(applications)
      setMyRegistrations(registrations)
      setMyDonations(donations)
      setMyMentorshipRequests(mentorshipRequests)
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
    const upcomingEvents = events.filter(event => {
      // Try multiple date fields and handle invalid dates
      let eventDate = null
      
      if (event.startAt) {
        eventDate = new Date(event.startAt)
      } else if (event.date) {
        eventDate = new Date(event.date)
      } else if (event.createdAt) {
        eventDate = new Date(event.createdAt)
      }
      
      // If no valid date found, don't include the event
      if (!eventDate || isNaN(eventDate.getTime())) {
        return false
      }
      
      // Check if event is in the future (more than 1 hour from now to avoid showing events that just started)
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
      return eventDate > oneHourFromNow
    })
    
    // Sort by earliest upcoming events first
    const sortedEvents = upcomingEvents.sort((a, b) => {
      const dateA = new Date(a.startAt || a.date || a.createdAt)
      const dateB = new Date(b.startAt || b.date || b.createdAt)
      return dateA - dateB // Earliest first
    })
    
    // Take only first 3 events
    const formatted = sortedEvents.slice(0, 3).map(event => {
      const eventDate = new Date(event.startAt || event.date || event.createdAt)
      return {
        id: event.id || event._id,
        title: event.title,
        date: eventDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: eventDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        type: event.organization || event.type || 'Event',
        description: event.description?.substring(0, 100) + '...' || 'Join this event',
        isRegistered: myRegistrations.some(reg => reg.eventId === event.id || reg.event === event._id)
      }
    })
    
    return formatted
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
                   app.status === 'Shortlisted' ? 'green' : 'purple',
      type: 'application',
      timestamp: new Date(app.appliedAt)
    }))
  }, [myApplications])

  // Get all activities combined
  const allActivities = useMemo(() => {
    const activities = []
    
    // Add applications
    myApplications.forEach(app => {
      activities.push({
        id: `app_${app.id}`,
        title: `Applied to ${app.opportunity?.title || 'Opportunity'}`,
        subtitle: app.opportunity?.company || 'Company',
        status: app.status || 'Applied',
        date: new Date(app.appliedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        type: 'application',
        typeLabel: 'Job Application',
        statusColor: app.status === 'Applied' ? 'blue' : 
                     app.status === 'Reviewed' ? 'yellow' : 
                     app.status === 'Shortlisted' ? 'green' : 'purple',
        timestamp: new Date(app.appliedAt)
      })
    })
    
    // Add event registrations
    myRegistrations.forEach(reg => {
      activities.push({
        id: `event_${reg.id}`,
        title: `Registered for ${reg.event?.title || 'Event'}`,
        subtitle: reg.event?.organization || 'Organization',
        status: 'Registered',
        date: new Date(reg.registeredAt || reg.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        type: 'event',
        typeLabel: 'Event Registration',
        statusColor: 'purple',
        timestamp: new Date(reg.registeredAt || reg.createdAt)
      })
    })
    
    // Add donations
    myDonations.forEach(donation => {
      activities.push({
        id: `donation_${donation.id}`,
        title: `Donated to ${donation.campaign?.title || 'Campaign'}`,
        subtitle: `Amount: ${donation.amount || 'N/A'}`,
        status: 'Completed',
        date: new Date(donation.donatedAt || donation.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        type: 'donation',
        typeLabel: 'Campaign Donation',
        statusColor: 'green',
        timestamp: new Date(donation.donatedAt || donation.createdAt)
      })
    })
    
    // Add mentorship requests
    myMentorshipRequests.forEach(request => {
      activities.push({
        id: `mentor_${request.id}`,
        title: `Mentorship request to ${request.mentor?.name || 'Mentor'}`,
        subtitle: request.subject || 'Request',
        status: request.status || 'Pending',
        date: new Date(request.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        type: 'mentorship',
        typeLabel: 'Mentor Request',
        statusColor: request.status === 'Accepted' ? 'green' : 
                     request.status === 'Rejected' ? 'red' : 'yellow',
        timestamp: new Date(request.createdAt)
      })
    })
    
    // Sort by timestamp (most recent first) and take top 5
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
  }, [myApplications, myRegistrations, myDonations, myMentorshipRequests])

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
      allActivities,
      calendarData,
      loading: loading || opportunitiesLoading || eventsLoading || donationsLoading,
      error,
      refresh: fetchStudentData,
    }),
    [overviewStats, formattedEvents, formattedApplications, allActivities, calendarData, loading, opportunitiesLoading, eventsLoading, donationsLoading, error, fetchStudentData]
  )
}

export default useStudentDashboard
