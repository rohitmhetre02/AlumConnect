import React, { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { get } from "../../utils/api"
import { User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, CheckCircle } from "lucide-react"

const FacultyDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;

    const profile = user?.profile || {};


    // ✅ Faculty-specific essential fields only
    const fields = [
      // Basic Info - must be actually filled
      user?.firstName || profile.raw?.firstName || profile.firstName || user?.name,
      user?.lastName || profile.raw?.lastName || profile.lastName,
      user?.email || profile.contact?.email || profile.email,
      user?.phone || profile.contact?.phone || profile.phone,
      
      // Essential Professional Info
      profile.department || profile.raw?.department || user?.department,
      profile.about || profile.raw?.about || user?.about || user?.bio,
      profile.experiences && (Array.isArray(profile.experiences) ? profile.experiences.length > 0 : !!profile.experiences),
      
      // Professional Links
      !!(profile.socials?.linkedin || profile.socials?.github || profile.socials?.instagram || 
          profile.linkedin || profile.github || profile.instagram),
          
      // Profile Pictures
      !!(profile.avatar || profile.raw?.avatar || user?.avatar),
      !!(profile.cover || profile.raw?.cover || user?.cover)
    ];

    const completed = fields.filter(f => {
      // Handle arrays - must have actual content
      if (Array.isArray(f)) {
        return f.length > 0;
      }
      
      // Handle booleans (from social links)
      if (typeof f === 'boolean') {
        return f === true;
      }
      
      // Handle strings and other values - must be actual meaningful content
      if (typeof f === 'string') {
        return f !== undefined && f !== null && f !== '' && 
               f !== 'N/A' && f !== 'Not specified' && f !== 'null' && f !== 'undefined' &&
               f !== 'NA' && f !== 'n/a' && f !== 'N/A' && f !== 'none' && f !== 'None' &&
               f !== 'Faculty' && f !== 'Faculty member' && f !== 'Academic Department' && f !== 'Campus';
      }
      
      // Handle objects - must have actual content
      if (typeof f === 'object' && f !== null) {
        return Object.keys(f).length > 0;
      }
      
      // Handle other types
      return f !== undefined && f !== null && f !== '';
    }).length;

    const completionPercentage = Math.round((completed / fields.length) * 100);
    
    // Only show 100% if actually 100% complete
    const finalPercentage = completionPercentage;
    
    
    const fieldNames = [
      'firstName', 'lastName', 'email', 'phone',
      'department', 'about', 'experience', 'socials', 'avatar', 'cover'
    ];
    
    fields.forEach((field, index) => {
      const isCompleted = (() => {
        if (Array.isArray(field)) return field.length > 0;
        if (typeof field === 'boolean') return field === true;
        if (typeof field === 'string') {
          return field !== undefined && field !== null && field !== '' && 
                 field !== 'N/A' && field !== 'Not specified' && field !== 'null' && field !== 'undefined' &&
                 field !== 'NA' && field !== 'n/a' && field !== 'N/A' && field !== 'none' && field !== 'None' &&
                 field !== 'Faculty' && field !== 'Faculty member' && field !== 'Academic Department' && field !== 'Campus';
        }
        if (typeof field === 'object' && field !== null) return Object.keys(field).length > 0;
        return field !== undefined && field !== null && field !== '';
      })();
      
    });

    return finalPercentage;
  }

  const profileCompletion = calculateProfileCompletion()

  // Helper function to get display name
  const getUserDisplayName = () => {
    const firstName = user?.firstName || user?.profile?.firstName;
    const lastName = user?.lastName || user?.profile?.lastName;
    const fullName = user?.name || user?.profile?.name;
    
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (fullName) return fullName;
    return 'Faculty Member';
  }

  // Helper function to get department
  const getUserDepartment = () => {
    return user?.department || user?.profile?.department || 'Not specified';
  }

  const [counts, setCounts] = useState({
    students: 0,
    alumni: 0,
    events: 0,
    campaigns: 0
  })

  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [
        studentsRes,
        alumniRes,
        eventsRes,
        activitiesRes
      ] = await Promise.all([
        get("/api/faculty/students"),
        get("/api/faculty/alumni"),
        get("/api/faculty/events/pending"),
        get("/api/faculty/student-activities")
      ])

      setCounts({
        students: studentsRes.count || 0,
        alumni: alumniRes.count || 0,
        events: eventsRes.count || 0,
        campaigns: 0
      })

      setUpcomingEvents(eventsRes.data || [])
      setRecentActivities(activitiesRes.data || [])

    } catch (err) {
      setError("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* WELCOME CARD */}

        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-300 via-pink-300 to-orange-300 rounded-xl p-4 text-slate-700 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-3">
              
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow">
                  {(user?.avatar ?? user?.profile?.avatar) ? (
                    <img 
                      src={user?.avatar ?? user?.profile?.avatar} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <User className="w-6 h-6 md:w-7 md:h-7 text-blue-500" 
                        style={{display: (user?.avatar ?? user?.profile?.avatar) ? 'none' : 'flex'}} />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold mb-1 text-slate-800">
                  Welcome back, {getUserDisplayName()}!
                </h1>
                
                {/* Role/Position */}
                <p className="text-slate-600 text-sm mb-2">
  {user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Faculty'}
</p>
                
                {/* Quick Info */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{getUserDepartment()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{user?.profile?.location || user?.location || 'Location'}</span>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Profile Completion</span>
                    <span className="text-xs font-bold text-slate-700">{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-white/70 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 rounded-full h-1.5 transition-all duration-300"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  {profileCompletion < 100 && (
                    <p className="text-xs text-slate-600 mt-1">
                      Complete your profile to get better opportunities
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    navigate('/dashboard/profile');
                  }}
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow text-xs"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">

</div>
      {/* Department Statistics */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Students</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.students}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Alumni</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.alumni}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Upcoming Events</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.events}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Campaigns</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.campaigns}
          </h2>
        </div>

      </div>


      {/* Upcoming Events */}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Upcoming Events
          </h2>
        </div>

        <div className="space-y-4">

          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No upcoming events
            </p>
          ) : (
            upcomingEvents.map(event => (

              <div
                key={event._id}
                className="border rounded-xl p-4 flex justify-between items-center hover:bg-slate-50"
              >

                <div>
                  <p className="font-medium text-slate-900">
                    {event.title}
                  </p>

                  <p className="text-sm text-slate-500">
                    {formatDate(event.date)}
                  </p>
                </div>

                <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {event.attendees || 0} attending
                </span>

              </div>

            ))
          )}

        </div>

      </div>


      {/* Recent Activities */}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          Recent Department Activities
        </h2>

        <div className="space-y-4">

          {recentActivities.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No activities found
            </p>
          ) : (
            recentActivities.map(activity => (

              <div
                key={activity._id}
                className="flex items-center gap-3 border rounded-xl p-4 hover:bg-slate-50"
              >

                <div className="text-xl">
                  {activity.type === "student" && "👨‍🎓"}
                  {activity.type === "alumni" && "🎓"}
                  {activity.type === "event" && "📅"}
                  {activity.type === "campaign" && "🎯"}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {activity.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatDate(activity.date)}
                  </p>
                </div>

              </div>

            ))
          )}

        </div>

        </div>

      </div>
    </div>
  )
}

export default FacultyDashboard