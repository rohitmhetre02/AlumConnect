import { useCallback, useEffect, useMemo, useState } from 'react'
import { get, post, put, del } from '../utils/api'
import useToast from './useToast'

const RESOURCE_ENDPOINT = '/api/mentors/me/resources'

const normalizeResource = (resource = {}) => {
  if (!resource) return null

  return {
    id: resource.id || resource._id || '',
    title: resource.title?.trim() || '',
    description: resource.description?.trim() || '',
    type: resource.type?.toLowerCase?.() || 'other',
    status: resource.status?.toLowerCase?.() || 'active',
    url: resource.url || '',
    filePublicId: resource.filePublicId || '',
    fileName: resource.fileName || '',
    fileType: resource.fileType || '',
    fileSize: typeof resource.fileSize === 'number' ? resource.fileSize : Number(resource.fileSize ?? 0),
    createdAt: resource.createdAt ? new Date(resource.createdAt) : null,
    updatedAt: resource.updatedAt ? new Date(resource.updatedAt) : null,
  }
}

const sortResources = (list = []) => {
  return [...list].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt
    }
    return a.title.localeCompare(b.title)
  })
}

export const useMentorResources = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchResources = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get(RESOURCE_ENDPOINT)
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      const normalized = sortResources(data.map(normalizeResource).filter(Boolean))
      setItems(normalized)
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load resources',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const createResource = useCallback(
    async ({ title, description, type, status, url, file }) => {
      try {
        setError(null)
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description ?? '')
        formData.append('type', type)
        formData.append('status', status)
        if (url) {
          formData.append('url', url)
        }
        if (file) {
          formData.append('file', file)
        }

        const response = await post(RESOURCE_ENDPOINT, formData)
        const resource = normalizeResource(response?.data ?? response)
        if (resource) {
          setItems((prev) => sortResources([resource, ...prev]))
        }
        toast?.({
          title: 'Resource uploaded',
          description: 'Your resource is now available for mentees.',
          tone: 'success',
        })
        return resource
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to upload resource',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  const updateResource = useCallback(
    async (resourceId, { title, description, type, status, url, file }) => {
      try {
        setError(null)
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description ?? '')
        formData.append('type', type)
        formData.append('status', status)
        if (url) {
          formData.append('url', url)
        }
        if (file) {
          formData.append('file', file)
        }

        const response = await put(`${RESOURCE_ENDPOINT}/${resourceId}`, formData)
        const resource = normalizeResource(response?.data ?? response)
        if (resource) {
          setItems((prev) => sortResources(prev.map((item) => (item.id === resource.id ? resource : item))))
        }
        toast?.({
          title: 'Resource updated',
          description: 'Changes saved successfully.',
          tone: 'success',
        })
        return resource
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to update resource',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  const deleteResource = useCallback(
    async (resourceId) => {
      try {
        setError(null)
        await del(`${RESOURCE_ENDPOINT}/${resourceId}`)
        setItems((prev) => prev.filter((item) => item.id !== resourceId))
        toast?.({
          title: 'Resource deleted',
          description: 'The resource has been removed.',
          tone: 'success',
        })
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to delete resource',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  return useMemo(
    () => ({
      resources: items,
      loading,
      error,
      refresh: fetchResources,
      createResource,
      updateResource,
      deleteResource,
    }),
    [items, loading, error, fetchResources, createResource, updateResource, deleteResource],
  )
}

export default useMentorResources
