import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'

const NOTE_COLORS = [
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  { name: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
]

const InteractiveCalendar = ({ initialNotes = [], onNotesChange, readOnly = false }) => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [notes, setNotes] = useState(initialNotes)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0])
  const [hoveredDate, setHoveredDate] = useState(null)

  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }, [])

  const formatDateKey = useCallback((year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }, [])

  const getNotesForDate = useCallback((day) => {
    if (!day) return []
    const key = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
    return notes.filter(note => note.dateKey === key)
  }, [currentDate, notes, formatDateKey])

  const handleDateClick = useCallback((day) => {
    if (!day || readOnly) return
    setSelectedDate(day)
    setNoteText('')
    setSelectedColor(NOTE_COLORS[0])
    setShowNoteModal(true)
  }, [readOnly])

  const handleAddNote = useCallback(() => {
    if (!noteText.trim() || !selectedDate) return

    const newNote = {
      id: Date.now().toString(),
      dateKey: formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDate),
      text: noteText.trim(),
      color: selectedColor.name,
      createdBy: user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
    }

    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    onNotesChange?.(updatedNotes)
    setNoteText('')
    setShowNoteModal(false)
  }, [noteText, selectedDate, currentDate, selectedColor, user, notes, onNotesChange, formatDateKey])

  const handleDeleteNote = useCallback((noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)
    onNotesChange?.(updatedNotes)
  }, [notes, onNotesChange])

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }, [])

  const days = getDaysInMonth(currentDate)
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-slate-900">{currentMonth}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayNotes = getNotesForDate(day)
          const hasNotes = dayNotes.length > 0
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear()

          return (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer relative group ${
                day ? 'hover:bg-slate-100' : ''
              } ${isToday ? 'bg-blue-50 font-bold' : ''}`}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day && (
                <>
                  <span className={`text-sm ${isToday ? 'text-blue-600' : 'font-medium text-slate-900'}`}>
                    {day}
                  </span>
                  {hasNotes && (
                    <div className="flex gap-1 mt-1">
                      {dayNotes.slice(0, 3).map((note, idx) => {
                        const colorConfig = NOTE_COLORS.find(c => c.name === note.color)
                        return (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${colorConfig?.dot || 'bg-gray-500'}`}
                          />
                        )
                      })}
                      {dayNotes.length > 3 && (
                        <span className="text-xs text-slate-400">+{dayNotes.length - 3}</span>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Hover Tooltip */}
              {hoveredDate === day && hasNotes && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
                  <div className="font-medium mb-1">Notes for {currentDate.toLocaleDateString('en-US', { month: 'short' })} {day}:</div>
                  {dayNotes.map((note, idx) => (
                    <div key={note.id} className="mb-1 last:mb-0">
                      <div className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        NOTE_COLORS.find(c => c.name === note.color)?.dot || 'bg-gray-500'
                      }`}></div>
                      {note.text.length > 30 ? `${note.text.substring(0, 30)}...` : note.text}
                    </div>
                  ))}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Add Note for {currentDate.toLocaleDateString('en-US', { month: 'short' })} {selectedDate}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter your note..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
              <div className="flex gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      selectedColor.name === color.name ? 'border-slate-400' : 'border-transparent'
                    } ${color.bg}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Notes */}
      {selectedDate && !readOnly && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Notes for {currentDate.toLocaleDateString('en-US', { month: 'short' })} {selectedDate}:
          </h4>
          {getNotesForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getNotesForDate(selectedDate).map((note) => {
                const colorConfig = NOTE_COLORS.find(c => c.name === note.color)
                return (
                  <div key={note.id} className={`flex items-start justify-between p-2 rounded-lg ${colorConfig?.bg || 'bg-gray-100'}`}>
                    <div className={`flex-1 text-sm ${colorConfig?.text || 'text-gray-700'}`}>
                      {note.text}
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No notes for this date</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-2">
          {NOTE_COLORS.map((color) => (
            <div key={color.name} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${color.dot}`}></div>
              <span className="text-xs text-slate-600 capitalize">{color.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InteractiveCalendar
