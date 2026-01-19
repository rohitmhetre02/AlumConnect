import { useCallback, useEffect, useMemo, useState } from 'react'
import { get, post, put, del } from '../utils/api'
import useToast from './useToast'

const SERVICE_ENDPOINT = '/api/mentors/me/services'

const MODE_LABELS = {
  online: 'Online',
  offline: 'Offline',
  hybrid: 'Hybrid',
}

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
}

const normalizeService = (service = {}) => {
  if (!service) return null
  const id = service.id || service._id || ''

  return {
    id,
    title: service.title?.trim() || '',
    description: service.description?.trim() || '',
    duration: service.duration?.trim() || '',
    price: typeof service.price === 'number' ? service.price : Number(service.price ?? 0),
    mode: service.mode?.toLowerCase?.() || 'online',
    status: service.status?.toLowerCase?.() || 'active',
    createdAt: service.createdAt ? new Date(service.createdAt) : null,
    updatedAt: service.updatedAt ? new Date(service.updatedAt) : null,
  }
}

const sortServices = (list = []) => {
  return [...list].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt
    }
    return a.title.localeCompare(b.title)
  })
}

export const useMentorServices = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get(SERVICE_ENDPOINT)
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      const normalized = sortServices(data.map(normalizeService).filter(Boolean))
      setItems(normalized)
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load services',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const createService = useCallback(
    async (payload) => {
      try {
        setError(null)
        const response = await post(SERVICE_ENDPOINT, payload)
        const service = normalizeService(response?.data ?? response)
        if (service) {
          setItems((prev) => sortServices([service, ...prev]))
        }
        toast?.({
          title: 'Service created',
          description: 'Your mentorship service is now live.',
          tone: 'success',
        })
        return service
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to create service',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  const updateService = useCallback(
    async (serviceId, payload) => {
      try {
        setError(null)
        const response = await put(`${SERVICE_ENDPOINT}/${serviceId}`, payload)
        const service = normalizeService(response?.data ?? response)
        if (service) {
          setItems((prev) => sortServices(prev.map((item) => (item.id === service.id ? service : item))))
        }
        toast?.({
          title: 'Service updated',
          description: 'Changes saved successfully.',
          tone: 'success',
        })
        return service
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to update service',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  const deleteService = useCallback(
    async (serviceId) => {
      try {
        setError(null)
        await del(`${SERVICE_ENDPOINT}/${serviceId}`)
        setItems((prev) => prev.filter((item) => item.id !== serviceId))
        toast?.({
          title: 'Service removed',
          description: 'The mentorship service has been deleted.',
          tone: 'success',
        })
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to delete service',
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
      services: items,
      loading,
      error,
      refresh: fetchServices,
      createService,
      updateService,
      deleteService,
      modeLabels: MODE_LABELS,
      statusLabels: STATUS_LABELS,
    }),
    [items, loading, error, fetchServices, createService, updateService, deleteService],
  )
}

export default useMentorServices
