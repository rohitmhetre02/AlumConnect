import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'

export const useGallery = () => {
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await get('/gallery/departments')
      if (response.success) {
        setDepartments(response.departments)
      }
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const fetchImages = useCallback(async (department, folder) => {
    if (!department || !folder) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await get(`/gallery/${encodeURIComponent(department)}/${encodeURIComponent(folder)}/images`)
      if (response.success) {
        setImages(response.images)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAllImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/gallery/all-images')
      if (response.success) {
        setImages(response.images)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    if (selectedDepartment && selectedFolder) {
      fetchImages(selectedDepartment, selectedFolder)
    }
  }, [selectedDepartment, selectedFolder, fetchImages])

  const folders = useMemo(() => {
    return ['Events', 'Campus', 'Traditional Day', 'Alumni Meet', 'Industrial Visit']
  }, [])

  return {
    departments,
    selectedDepartment,
    setSelectedDepartment,
    selectedFolder,
    setSelectedFolder,
    images,
    loading,
    error,
    folders,
    fetchImages,
    fetchAllImages,
    refetchImages: () => {
      if (selectedDepartment && selectedFolder) {
        fetchImages(selectedDepartment, selectedFolder)
      } else {
        fetchAllImages()
      }
    }
  }
}

export default useGallery
