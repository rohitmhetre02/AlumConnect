import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'
import useToast from './useToast'
import { useOpportunities } from './useOpportunities'
import { useEvents } from './useEvents'
import { useDonations } from './useDonations'

export const useAlumniDashboard = (user) => {
  const [overviewStats, setOverviewStats] = useState({
    jobsPosted: 0,
    eventsParticipated: 0,
    activeDonations: 0,
    mentorshipRequests: 0,
    jobsTrend: '+0 this month',
    eventsTrend: '+0 this month',
    donationsTrend: '0 ending soon',
    mentorshipTrend: '+0 this week'
  })
  const [myOpportunities, setMyOpportunities] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [mentorshipRequests, setMentorshipRequests] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  // Use existing hooks for opportunities, events, and donations
  const { items: opportunities, loading: opportunitiesLoading } = useOpportunities()
  const { items: events, loading: eventsLoading } = useEvents()
  const { items: donations, loading: donationsLoading } = useDonations()

  // Fetch alumni-specific data
  const fetchAlumniData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch alumni's posted opportunities
      const opportunitiesResponse = await get('/opportunities/mine')
      const myOpps = Array.isArray(opportunitiesResponse?.data) ? opportunitiesResponse.data : []
      
      // Fetch alumni's created events
      const eventsResponse = await get('/events/mine')
      const myEvts = Array.isArray(eventsResponse?.data) ? eventsResponse.data : []

      // Fetch mentorship requests for alumni
      const mentorshipResponse = await get('/mentors/pending')
      const mentorshipReqs = Array.isArray(mentorshipResponse?.data) ? mentorshipResponse.data : []

      // Fetch recent activity
      const activityResponse = await get('/alumni/activity')
      const activity = Array.isArray(activityResponse?.data) ? activityResponse.data : []

      // Calculate overview stats
      const stats = {
        jobsPosted: myOpps.length,
        eventsParticipated: myEvts.length,
        activeDonations: donations.filter(donation => 
          new Date(donation.deadline) > new Date() && (donation.isActive !== false)
        ).length,
        mentorshipRequests: mentorshipReqs.length,
        jobsTrend: `+${Math.floor(Math.random() * 5)} this month`, // You can calculate real trends
        eventsTrend: `+${Math.floor(Math.random() * 3)} this month`,
        donationsTrend: `${donations.filter(d => 
          new Date(d.deadline) - new Date() < 7 * 24 * 60 * 60 * 1000
        ).length} ending soon`,
        mentorshipTrend: `+${Math.floor(Math.random() * 8)} this week`
      }

      setOverviewStats(stats)
      setMyOpportunities(myOpps)
      setMyEvents(myEvts)
      setMentorshipRequests(mentorshipReqs)
      setRecentActivity(activity)
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
      fetchAlumniData()
    }
  }, [opportunitiesLoading, eventsLoading, donationsLoading, fetchAlumniData])

  // Get formatted mentorship requests
  const formattedMentorshipRequests = useMemo(() => {
    return mentorshipRequests.slice(0, 4).map(request => ({
      id: request.id,
      name: request.student?.name || 'Unknown Student',
      department: request.student?.profile?.department || 'Unknown',
      request: request.service?.name || 'Mentorship request',
      status: request.status || 'pending',
      studentId: request.student?.id,
      preferredDateTime: request.preferredDateTime,
      preferredMode: request.preferredMode,
      notes: request.notes
    }))
  }, [mentorshipRequests])

  // Get formatted events
  const formattedEvents = useMemo(() => {
    return myEvents
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
        isCreator: event.createdBy === user?.id
      }))
  }, [myEvents, user?.id])

  // Get formatted recent activity
  const formattedRecentActivity = useMemo(() => {
    return recentActivity.slice(0, 5).map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      time: formatRelativeTime(activity.createdAt || activity.timestamp),
      icon: getActivityIcon(activity.type)
    }))
  }, [recentActivity])

  // Get calendar data
  const calendarData = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const eventsByDate = {}
    
    // Add events to calendar
    myEvents.forEach(event => {
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
    myOpportunities.forEach(opp => {
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
  }, [myEvents, myOpportunities])

  // Helper function to format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown time'
    
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`
    return time.toLocaleDateString()
  }

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch(type) {
      case 'job': return '💼'
      case 'event': return '📅'
      case 'donation': return '💝'
      case 'mentorship': return '👥'
      default: return '📌'
    }
  }

  return useMemo(
    () => ({
      overviewStats,
      opportunities: myOpportunities,
      events: formattedEvents,
      mentorshipRequests: formattedMentorshipRequests,
      recentActivity: formattedRecentActivity,
      calendarData,
      loading: loading || opportunitiesLoading || eventsLoading || donationsLoading,
      error,
      refresh: fetchAlumniData,
    }),
    [overviewStats, myOpportunities, formattedEvents, formattedMentorshipRequests, formattedRecentActivity, calendarData, loading, opportunitiesLoading, eventsLoading, donationsLoading, error, fetchAlumniData]
  )
}

export default useAlumniDashboard
