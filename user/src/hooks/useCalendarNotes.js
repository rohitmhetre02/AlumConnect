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
    const userId = user?.id || user?._id || user?.profile?.id || user?.profile?._id
    console.log('Calendar Notes - User data:', user)
    console.log('Calendar Notes - Extracted userId:', userId)
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await get(`/api/calendar/notes/${userId}`)
      if (response?.data) {
        setNotes(response.data)
      }
    } catch (err) {
      // Don't log 404 errors - calendar notes might not exist yet
      if (err.status !== 404) {
        console.error('Failed to fetch calendar notes:', err)
        setError(err.message || 'Failed to load notes')
      }
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?._id, user?.profile?.id, user?.profile?._id])

  // Add a new note
  const addNote = useCallback(async (noteData) => {
    const userId = user?.id || user?._id || user?.profile?.id || user?.profile?._id
    if (!userId) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await post('/api/calendar/notes', {
        ...noteData,
        userId: userId,
      })
      
      if (response?.data) {
        setNotes(prev => [...prev, response.data])
        return response.data
      }
    } catch (err) {
      console.error('Failed to add calendar note:', err)
      setError(err.message || 'Failed to add note')
      return null
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
      const response = await post(`/api/calendar/notes/${noteId}`, updateData)
      
      if (response?.data) {
        setNotes(prev => prev.map(note => 
          note._id === noteId ? { ...note, ...response.data } : note
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
      await del(`/api/calendar/notes/${noteId}`)
      setNotes(prev => prev.filter(note => note._id !== noteId))
      return true
    } catch (err) {
      console.error('Failed to delete calendar note:', err)
      setError(err.message || 'Failed to delete note')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Get note for a specific date
  const getNoteForDate = useCallback((date) => {
    return notes.find(note => note.date === date)
  }, [notes])

  // Get notes for a date range
  const getNotesForDateRange = useCallback((startDate, endDate) => {
    return notes.filter(note => {
      const noteDate = new Date(note.date)
      return noteDate >= startDate && noteDate <= endDate
    })
  }, [notes])

  // Initialize notes on component mount
  useEffect(() => {
    if (user?.id) {
      fetchNotes()
    }
  }, [user?.id, fetchNotes])

  return {
    notes,
    loading,
    error,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    getNoteForDate,
    getNotesForDateRange,
  }
}

export default useCalendarNotes
