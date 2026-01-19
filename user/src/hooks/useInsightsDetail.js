import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { get } from '../utils/api'

const DEFAULT_PAGE_SIZE = 10

const useInsightsDetail = (type, { page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const paginationRef = useRef({ page, pageSize })
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(() => {
    const initial = { page, pageSize }
    paginationRef.current = initial
    return initial
  })

  paginationRef.current = pagination

  const fetchDetail = useCallback(
    async (pageArg, limitArg) => {
      if (!type) return
      setLoading(true)
      setError(null)

      const current = paginationRef.current
      const pageToUse = Number(pageArg ?? current.page ?? 1)
      const limitToUse = Number(limitArg ?? current.pageSize ?? DEFAULT_PAGE_SIZE)

      try {
        const query = new URLSearchParams({ page: pageToUse, limit: limitToUse }).toString()
        const response = await get(`/api/insights/details/${type}?${query}`)
        const payload = response?.data ?? response

        if (!payload) {
          throw new Error('No data returned from insights detail API.')
        }

        const nextPagination = {
          page: Number(payload.page ?? pageToUse),
          pageSize: Number(payload.pageSize ?? limitToUse),
        }

        paginationRef.current = nextPagination
        setItems(Array.isArray(payload.items) ? payload.items : [])
        setTotal(Number(payload.total ?? 0))
        setPagination((prev) => {
          if (prev.page === nextPagination.page && prev.pageSize === nextPagination.pageSize) {
            return prev
          }
          return nextPagination
        })
      } catch (err) {
        console.error('useInsightsDetail error:', err)
        setError(err)
        setItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    [type],
  )

  useEffect(() => {
    if (!type) return
    fetchDetail(page, pageSize)
  }, [type, page, pageSize, fetchDetail])

  const totalPages = useMemo(() => {
    if (!pagination.pageSize) return 0
    return Math.ceil(total / pagination.pageSize)
  }, [total, pagination.pageSize])

  return {
    items,
    total,
    loading,
    error,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
    refresh: () => fetchDetail(paginationRef.current.page, paginationRef.current.pageSize),
    setPage: (nextPage) => fetchDetail(nextPage, paginationRef.current.pageSize),
    setPageSize: (nextSize) => fetchDetail(1, nextSize),
  }
}

export default useInsightsDetail
