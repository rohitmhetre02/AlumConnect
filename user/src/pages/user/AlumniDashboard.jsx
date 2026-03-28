import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import useAlumniDashboard from '../../hooks/useAlumniDashboard'
import InteractiveCalendar from '../../components/shared/InteractiveCalendar'
import useCalendarNotes from '../../hooks/useCalendarNotes'

const CATEGORY_COLORS = {
  mentorship: { bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'Mentorship', colorName: 'Blue' },
  event: { bg: 'bg-purple-100', dot: 'bg-purple-500', text: 'Event', colorName: 'Purple' },
  opportunity: { bg: 'bg-green-100', dot: 'bg-green-500', text: 'Opportunity', colorName: 'Green' }
}

const AlumniDashboard = () => {

  const { user } = useAuth()

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
      console.error('Failed to save note:', error)
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
        console.error('Failed to delete note:', error)
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

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}

        <header className="mb-8">

  <h1 className="text-3xl font-semibold text-slate-900">
    Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'Alumni'}
  </h1>

  <p className="text-sm text-slate-500 mt-1">
    Batch: {user?.profile?.graduationYear || user?.graduationYear || user?.passoutYear || 'N/A'} • {user?.profile?.department || user?.department || 'Information Technology'}
  </p>

</header>


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
                  link="/dashboard/opportunities/post"
                />

                <ActionCard
                  title="Create Event"
                  desc="Organize networking events"
                  btn="Create Event"
                  color="bg-purple-100 text-purple-700"
                  link="/dashboard/events/post"
                />

                <ActionCard
                  title="Support Campaign"
                  desc="Support institutional development"
                  btn="Donate"
                  color="bg-green-100 text-green-700"
                  link="/dashboard/donations"
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
                          onClick={() => window.location.href = `/dashboard/events/${e.id}`}
                          className="px-3 -1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => window.location.href = `/dashboard/events/${e.id}`}
                          className={`px-3 -1 text-sm rounded-lg transition-colors ${
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
                    onClick={() => window.location.href = '/dashboard/events/post'}
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
                      onClick={() => window.location.href = '/dashboard/opportunities/post'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post Opportunity
                    </button>
                    <button 
                      onClick={() => window.location.href = '/dashboard/events/post'}
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


function ActionCard({title,desc,btn,color,link}){

  return(

    <div className="bg-white border rounded-xl p-6">

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="text-sm text-slate-600 mt-1">
        {desc}
      </p>

      <button
        onClick={()=>window.location.href=link}
        className={`mt-4 px-4 py-2 text-sm rounded ${color}`}
      >
        {btn}
      </button>

    </div>

  )

}

export default AlumniDashboard