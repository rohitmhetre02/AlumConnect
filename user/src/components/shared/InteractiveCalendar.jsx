import { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'

// Category color mapping
const CATEGORY_COLORS = {
  mentorship: { 
    bg: 'bg-blue-100', 
    dot: 'bg-blue-500', 
    text: 'Mentorship', 
    colorName: 'Blue',
    border: 'border-blue-200'
  },
  event: { 
    bg: 'bg-purple-100', 
    dot: 'bg-purple-500', 
    text: 'Event', 
    colorName: 'Purple',
    border: 'border-purple-200'
  },
  opportunity: { 
    bg: 'bg-green-100', 
    dot: 'bg-green-500', 
    text: 'Opportunity', 
    colorName: 'Green',
    border: 'border-green-200'
  }
}

const InteractiveCalendar = ({ notes = [], onDateClick, onNotesChange }) => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
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

  const getNoteForDate = useCallback((day) => {
    if (!day || !notes || !Array.isArray(notes)) return null
    const key = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
    return notes.find(note => note.date === key)
  }, [currentDate, notes, formatDateKey])

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
          const note = getNoteForDate(day)
          const hasNote = !!note
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear()

          return (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer relative group ${
                day ? 'hover:bg-slate-100' : ''
              } ${isToday ? 'bg-blue-50 font-bold' : ''}`}
              onClick={() => {
                console.log('InteractiveCalendar - Date clicked:', day)
                if (day && onDateClick) {
                  const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day)
                  console.log('InteractiveCalendar - Calling onDateClick with:', dateKey)
                  onDateClick(dateKey)
                }
              }}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day && (
                <>
                  <span className={`text-sm ${isToday ? 'text-blue-600' : 'font-medium text-slate-900'}`}>
                    {day}
                  </span>
                  {hasNote && (
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${CATEGORY_COLORS[note.category]?.dot || 'bg-gray-500'}`} />
                  )}
                </>
              )}

              {/* Hover Tooltip */}
              {hoveredDate === day && hasNote && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
                  <div className="font-medium mb-1 capitalize">
                    {CATEGORY_COLORS[note.category]?.text || 'Note'}
                  </div>
                  <div className="text-xs opacity-90">
                    {note.noteText}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* New Legend - Only 3 Categories */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Categories</h4>
        <div className="flex flex-wrap gap-4">
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color.dot}`} />
              <span className="text-sm text-slate-600">
                {color.text} ({color.colorName})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InteractiveCalendar
