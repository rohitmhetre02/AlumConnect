import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { get, post, del } from '../utils/api'

const useCalendarNotes = () => {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch notes for the current user
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await get(`/calendar/notes/${user.id}`)
      if (response?.data) {
        setNotes(response.data)
      }
    } catch (err) {
      // Don't log 404 errors - calendar notes might not exist yet
      if (err.status !== 404) {
        console.error('Failed to fetch calendar notes:', err)
        setError(err.message || 'Failed to load notes')
      }
      // For development, use mock data if API fails
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Add a new note
  const addNote = useCallback(async (noteData) => {
    if (!user?.id) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await post('/calendar/notes', {
        ...noteData,
        userId: user.id,
      })
      
      if (response?.data) {
        setNotes(prev => [...prev, response.data])
        return response.data
      }
    } catch (err) {
      console.error('Failed to add calendar note:', err)
      setError(err.message || 'Failed to add note')
      
      // For development, create a mock note
      const mockNote = {
        id: Date.now().toString(),
        ...noteData,
        userId: user.id,
        createdAt: new Date().toISOString(),
      }
      setNotes(prev => [...prev, mockNote])
      return mockNote
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Update an existing note
  const updateNote = useCallback(async (noteId, updateData) => {
    if (!user?.id) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await post(`/calendar/notes/${noteId}`, updateData)
      
      if (response?.data) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, ...response.data } : note
        ))
        return response.data
      }
    } catch (err) {
      console.error('Failed to update calendar note:', err)
      setError(err.message || 'Failed to update note')
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Delete a note
  const deleteNote = useCallback(async (noteId) => {
    if (!user?.id) return false
    
    setLoading(true)
    setError(null)
    
    try {
      await del(`/calendar/notes/${noteId}`)
      setNotes(prev => prev.filter(note => note.id !== noteId))
      return true
    } catch (err) {
      console.error('Failed to delete calendar note:', err)
      setError(err.message || 'Failed to delete note')
      
      // For development, just remove from local state
      setNotes(prev => prev.filter(note => note.id !== noteId))
      return true
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Get notes for a specific date
  const getNotesForDate = useCallback((dateKey) => {
    return notes.filter(note => note.dateKey === dateKey)
  }, [notes])

  // Get notes for a date range
  const getNotesForDateRange = useCallback((startDate, endDate) => {
    return notes.filter(note => {
      const noteDate = new Date(note.dateKey)
      return noteDate >= startDate && noteDate <= endDate
    })
  }, [notes])

  // Initialize notes on component mount
  useEffect(() => {
    if (user?.id) {
      fetchNotes()
    }
  }, [user?.id])

  // Auto-refresh notes every 30 seconds for real-time updates
  useEffect(() => {
    if (!user?.id) return
    
    const interval = setInterval(() => {
      fetchNotes()
    }, 30000)

    return () => clearInterval(interval)
  }, [user?.id])

  return {
    notes,
    loading,
    error,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    getNotesForDate,
    getNotesForDateRange,
  }
}

export default useCalendarNotes
