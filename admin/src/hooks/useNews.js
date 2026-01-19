import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

const normalizeISO = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const formatArticle = (article) => {
  if (!article) return null
  return {
    ...article,
    publishedAt: normalizeISO(article.publishedAt),
    createdAt: normalizeISO(article.createdAt),
    updatedAt: normalizeISO(article.updatedAt),
  }
}

export const useNewsArticle = (id) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (!id) {
      setLoading(false)
      setData(null)
      return () => {}
    }

    const fetchArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get(`/news/${id}`, { includeAuth: true })
        if (!isMounted) return
        setData(formatArticle(response?.data ?? null))
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        console.error('Unable to load news article:', fetchError)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchArticle()

    return () => {
      isMounted = false
    }
  }, [id])

  return { data, loading, error }
}

export default useNewsArticle
