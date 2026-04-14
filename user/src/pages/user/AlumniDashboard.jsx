import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAlumniDashboard from '../../hooks/useAlumniDashboard'
import InteractiveCalendar from '../../components/shared/InteractiveCalendar'
import useCalendarNotes from '../../hooks/useCalendarNotes'
import WelcomeNotification from '../../components/user/WelcomeNotification'
import { User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, CheckCircle } from 'lucide-react'

const CATEGORY_COLORS = {
  mentorship: { bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'Mentorship', colorName: 'Blue' },
  event: { bg: 'bg-purple-100', dot: 'bg-purple-500', text: 'Event', colorName: 'Purple' },
  opportunity: { bg: 'bg-green-100', dot: 'bg-green-500', text: 'Opportunity', colorName: 'Green' }
}

const AlumniDashboard = () => {

  const { user } = useAuth()
  const navigate = useNavigate()

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;

    const profile = user?.profile || {};

    // ✅ Track EXACT fields from Profile.jsx structure with ultra-lenient checks
    const fields = [
      // Basic Info (from profile.raw and user object)
      user?.firstName || profile.raw?.firstName || profile.firstName,
      user?.lastName || profile.raw?.lastName || profile.lastName,
      user?.email || profile.contact?.email || profile.email,
      user?.phone || profile.contact?.phone || profile.phone,

      // Profile Summary
      profile.title || profile.raw?.title || user?.title,
      profile.about || profile.raw?.about || user?.about || user?.bio,
      profile.avatar || profile.raw?.avatar || user?.avatar,
      profile.cover || profile.raw?.cover || user?.cover,

      // Academic Info
      profile.department || profile.raw?.department || user?.department,
      profile.passoutYear || profile.raw?.passoutYear || user?.passoutYear || user?.graduationYear,
      
      // Social Links - ultra lenient (count if ANY exists)
      !!(profile.socials?.linkedin || profile.socials?.github || profile.socials?.instagram || 
          profile.linkedin || profile.github || profile.instagram),
      
      // Skills & Experience - ultra lenient checks
      !!(profile.skills && (Array.isArray(profile.skills) ? profile.skills.length > 0 : !!profile.skills)),
      !!(profile.experiences && (Array.isArray(profile.experiences) ? profile.experiences.length > 0 : !!profile.experiences)),
      !!(profile.education && (Array.isArray(profile.education) ? profile.education.length > 0 : !!profile.education)),
      !!(profile.certifications && (Array.isArray(profile.certifications) ? profile.certifications.length > 0 : !!profile.certifications))
    ];

    const completed = fields.filter(f => {
      // Handle booleans (from social links)
      if (typeof f === 'boolean') return f;
      
      // Handle arrays
      if (Array.isArray(f)) {
        return f.length > 0;
      }
      
      // Handle objects
      if (typeof f === 'object' && f !== null) {
        return Object.keys(f).length > 0;
      }
      
      // Handle strings and other values - ultra lenient
      return f !== undefined && f !== null && f !== '' && 
             f !== 'N/A' && f !== 'Not specified' && f !== 'null' && f !== 'undefined' &&
             f !== 'NA' && f !== 'n/a' && f !== 'N/A' && f !== 'none' && f !== 'None';
    }).length;

    const completionPercentage = Math.round((completed / fields.length) * 100);
    
    // If completion is very high (>= 90%), consider it 100% for user experience
    const finalPercentage = completionPercentage >= 90 ? 100 : completionPercentage;
    
    
    const fieldNames = [
      'firstName', 'lastName', 'email', 'phone',
      'title', 'about', 'avatar', 'cover',
      'department', 'passoutYear',
      'socials (any)', 'skills', 'experiences', 'education', 'certifications'
    ];
    
    fields.forEach((field, index) => {
      const isCompleted = (() => {
        if (typeof field === 'boolean') return field;
        if (Array.isArray(field)) return field.length > 0;
        if (typeof field === 'object' && field !== null) return Object.keys(field).length > 0;
        return field !== undefined && field !== null && field !== '' && 
               field !== 'N/A' && field !== 'Not specified' && field !== 'null' && field !== 'undefined' &&
               field !== 'NA' && field !== 'n/a' && field !== 'N/A' && field !== 'none' && field !== 'None';
      })();
      
    });
    

    return finalPercentage;
  }

  const profileCompletion = calculateProfileCompletion()

  const [selectedDate, setSelectedDate] = useState(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteCategory, setNoteCategory] = useState('mentorship')
  const [noteText, setNoteText] = useState('')
  const [editingNote, setEditingNote] = useState(null)

  const {
    overviewStats,
    opportunities,
    events,
    mentorshipRequests,
    recentActivity,
    calendarData,
    loading,
    error,
    refresh
  } = useAlumniDashboard(user)

  const { notes, addNote, updateNote, deleteNote } = useCalendarNotes()

  const handleDateClick = (date) => {
    setSelectedDate(date)
    
    // Check if note exists for this date
    const existingNote = getNote(date)
    if (existingNote) {
      // Edit mode
      setNoteCategory(existingNote.category)
      setNoteText(existingNote.noteText)
      setEditingNote(existingNote)
    } else {
      // Add mode
      setNoteCategory('mentorship')
      setNoteText('')
      setEditingNote(null)
    }
    
    setShowNoteModal(true)
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return

    try {
      if (editingNote) {
        // Update existing note
        await updateNote(editingNote._id, {
          category: noteCategory,
          noteText: noteText.trim()
        })
      } else {
        // Add new note
        await addNote({
          date: selectedDate,
          category: noteCategory,
          noteText: noteText.trim()
        })
      }

      setShowNoteModal(false)
      setNoteText('')
      setEditingNote(null)
    } catch (error) {
      // Failed to save note
    }
  }

  const handleDeleteNote = async () => {
    if (editingNote) {
      try {
        await deleteNote(editingNote._id)
        setShowNoteModal(false)
        setNoteText('')
        setEditingNote(null)
      } catch (error) {
        // Failed to delete note
      }
    }
  }

  const getNote = (date) => {
    return notes.find(n => n.date === date)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Loading Dashboard...
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-slate-50">
      {/* Welcome Notification for admin-created users */}
      <WelcomeNotification 
        firstName={user?.firstName || user?.name?.split(' ')[0] || 'User'} 
      />

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
                  Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'Alumni'}!
                </h1>
                
                {/* Role/Position */}
                <p className="text-slate-600 text-sm mb-2">
  {user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Alumni'}
</p>
                
                {/* Quick Info */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>Passout Year: {user?.profile?.graduationYear || user?.graduationYear || user?.passoutYear || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{user?.profile?.department || user?.department || 'Computer Engineering'}</span>
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


        {/* STATS */}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <StatCard
            title="Opportunities Posted"
            value={overviewStats.jobsPosted}
          />

          <StatCard
            title="Events Created or Participated"
            value={overviewStats.eventsParticipated}
          />

          <StatCard
            title="Active Donation Campaigns"
            value={overviewStats.activeDonations}
          />

          <StatCard
            title="Mentorship Requests Received"
            value={overviewStats.mentorshipRequests}
          />

        </section>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">


          {/* LEFT SIDE */}

          <div className="xl:col-span-2 space-y-8">

            {/* CONTRIBUTION ACTIONS */}

            <section>

              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Quick  Actions
              </h2>

              <div className="grid md:grid-cols-3 gap-4">

                <ActionCard
                  title="Post Opportunity"
                  desc="Share job opportunities with students"
                  btn="Post Opportunity"
                  color="bg-blue-100 text-blue-700"
                  onClick={() => navigate('/dashboard/opportunities/post')}
                />

                <ActionCard
                  title="Create Event"
                  desc="Organize networking events"
                  btn="Create Event"
                  color="bg-purple-100 text-purple-700"
                  onClick={() => navigate('/dashboard/events/post')}
                />

                <ActionCard
                  title="Support Campaign"
                  desc="Support institutional development"
                  btn="Donate"
                  color="bg-green-100 text-green-700"
                  onClick={() => navigate('/dashboard/campaigns/create')}
                />

              </div>

            </section>


            {/* UPCOMING EVENTS */}

            <section>

              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Upcoming Events
              </h2>

              {events.length ? (

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {events.map(e => (

                    <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {e.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {e.date}
                          </p>
                          <p className="text-sm text-slate-500">
                            {e.time}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full ml-3">
                          {e.type}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {e.description}
                      </p>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/events/${e.id}`)}
                          className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => navigate(`/dashboard/events/${e.id}`)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            e.isCreator 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {e.isCreator ? 'Manage' : 'Register'}
                        </button>
                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600 mb-4">No upcoming events</p>
                  <button 
                    onClick={() => navigate('/dashboard/events/post')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create an Event
                  </button>
                </div>

              )}

            </section>


            {/* RECENT ACTIVITY */}

            <section>

              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Recent Activity
              </h2>

              {recentActivity.length ? (

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recentActivity.map((activity) => (
                        <tr key={activity.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                              <p className="text-xs text-slate-500">{activity.subtitle}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                              {activity.typeLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              activity.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                              activity.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                              activity.statusColor === 'red' ? 'bg-red-100 text-red-700' :
                              activity.statusColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{activity.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>

              ) : (

                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600 mb-4">No recent activity</p>
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => navigate('/dashboard/opportunities/post')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post Opportunity
                    </button>
                    <button 
                      onClick={() => navigate('/dashboard/events/post')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                </div>

              )}

            </section>

          </div>


          {/* RIGHT SIDE CALENDAR */}

          <div>

            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Calendar
            </h2>

            <div className="bg-white border rounded-xl p-6">

              <InteractiveCalendar
                notes={notes}
                onDateClick={handleDateClick}
              />

            </div>

          </div>

        </div>


        {/* NOTE MODAL */}

        {showNoteModal && selectedDate && (

          <div className="fixed inset-0 flex items-center justify-center bg-black/40">

            <div className="bg-white rounded-xl p-6 w-96">

              <h3 className="text-lg font-semibold mb-4">
                {editingNote ? 'Edit Calendar Note' : 'Add Calendar Note'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date
                </label>
                <div className="text-sm text-slate-600">
                  {selectedDate}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(CATEGORY_COLORS).map(category => (
                    <button
                      key={category}
                      onClick={() => setNoteCategory(category)}
                      className={`p-2 text-sm rounded border capitalize ${
                        noteCategory === category
                        ? CATEGORY_COLORS[category].bg + ' border-slate-300'
                        : 'bg-white border-slate-200'
                      }`}
                    >
                      {CATEGORY_COLORS[category].text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Note
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm resize-none"
                  rows={3}
                  placeholder="Write your note here..."
                />
              </div>

              <div className="flex justify-between gap-2">
                <div>
                  {editingNote && (
                    <button
                      onClick={handleDeleteNote}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNoteModal(false)
                      setEditingNote(null)
                      setNoteText('')
                    }}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={!noteText.trim()}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingNote ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  )
}


function StatCard({title,value}){

  return(

    <div className="bg-white border rounded-xl p-6">

      <p className="text-sm text-slate-600">
        {title}
      </p>

      <p className="text-2xl font-semibold text-slate-900 mt-2">
        {value}
      </p>

    </div>

  )

}


function ActionCard({title,desc,btn,color,onClick}){

  return(

    <div className="bg-white border rounded-xl p-6">

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="text-sm text-slate-600 mt-1">
        {desc}
      </p>

      <button
        onClick={onClick}
        className={`mt-4 px-4 py-2 text-sm rounded ${color}`}
      >
        {btn}
      </button>

    </div>

  )

}

export default AlumniDashboard