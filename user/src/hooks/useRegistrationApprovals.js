import { useCallback, useState } from 'react'
import { get, post } from '../utils/api'

const COORDINATOR_BASE = '/admin/registration-approval/coordinator'
const ADMIN_BASE = '/admin/registration-approval/admin'

const buildError = (error) => {
  if (!error) return 'Something went wrong. Please try again.'
  if (typeof error === 'string') return error
  return error.message || 'Unable to complete the request.'
}

const useRegistrationApprovals = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(buildError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getCoordinatorPending = useCallback(
    (roleFilter = 'all') =>
      run(() => {
        const query = roleFilter && roleFilter !== 'all' ? `?role=${encodeURIComponent(roleFilter)}` : ''
        return get(`${COORDINATOR_BASE}/pending${query}`)
      }),
    [run],
  )

  const getCoordinatorStats = useCallback(
    () => run(() => get(`${COORDINATOR_BASE}/stats`)),
    [run],
  )

  const coordinatorDecision = useCallback(
    ({ userId, role, action, reason }) =>
      run(() =>
        post(`${COORDINATOR_BASE}/decision`, {
          userId,
          role,
          action,
          reason,
        }),
      ),
    [run],
  )

  const getAdminPending = useCallback(
    (roleFilter = 'all') =>
      run(() => {
        const query = roleFilter && roleFilter !== 'all' ? `?role=${encodeURIComponent(roleFilter)}` : ''
        return get(`${ADMIN_BASE}/pending${query}`)
      }),
    [run],
  )

  const getAdminStats = useCallback(
    () => run(() => get(`${ADMIN_BASE}/stats`)),
    [run],
  )

  const adminDecision = useCallback(
    ({ userId, role, action, reason }) =>
      run(() =>
        post(`${ADMIN_BASE}/decision`, {
          userId,
          role,
          action,
          reason,
        }),
      ),
    [run],
  )

  return {
    loading,
    error,
    getCoordinatorPending,
    getCoordinatorStats,
    coordinatorDecision,
    getAdminPending,
    getAdminStats,
    adminDecision,
    setError,
  }
}

export default useRegistrationApprovals
