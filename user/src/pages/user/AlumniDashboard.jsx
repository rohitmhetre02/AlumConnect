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
    Welcome back, {user?.name?.split(' ')[0] || 'User'}
  </h1>

  <p className="text-sm text-slate-500 mt-1">
    Batch: {user?.profile?.graduationYear || user?.graduationYear || 'N/A'} • {user?.profile?.department || user?.department || 'Department'}
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

                  {events.slice(0,3).map(e => (

                    <div key={e.id} className="bg-white border rounded-xl p-5">

                      <p className="font-semibold text-slate-900">
                        {e.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        {e.date}
                      </p>

                      <p className="text-sm text-slate-400">
                        {e.location}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="bg-white border rounded-xl p-6 text-center text-slate-500">
                  No upcoming events
                </div>

              )}

            </section>


            {/* RECENT ACTIVITY */}

            <section>

              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Recent Activity
              </h2>

              <div className="bg-white border rounded-xl p-6">

                {recentActivity.length ? (

                  recentActivity.slice(0,5).map(a => (

                    <div key={a.id} className="mb-4">

                      <p className="text-sm font-semibold text-slate-900">
                        {a.title}
                      </p>

                      <p className="text-xs text-slate-400">
                        {a.time}
                      </p>

                      <p className="text-sm text-slate-600">
                        {a.description}
                      </p>

                    </div>

                  ))

                ) : (

                  <p className="text-slate-500 text-sm">
                    No recent activity
                  </p>

                )}

              </div>

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