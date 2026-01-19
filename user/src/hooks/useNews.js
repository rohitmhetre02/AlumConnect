import { useCallback, useEffect, useMemo, useState } from 'react'

import { get, post } from '../utils/api'
import useToast from './useToast'

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

export const useNews = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/news', { includeAuth: false })
      const data = Array.isArray(response?.data) ? response.data : []
      setItems(data.map(formatArticle).filter(Boolean))
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load news',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const createNews = useCallback(
    async ({ title, subtitle, category, excerpt, content, coverImage, readingTimeMinutes, publishedAt }) => {
      try {
        const response = await post('/news', {
          title,
          subtitle,
          category,
          excerpt,
          content,
          coverImage,
          readingTimeMinutes,
          publishedAt,
        })

        const formatted = formatArticle(response?.data)
        if (formatted) {
          setItems((prev) => [formatted, ...prev])
        }

        addToast?.({
          title: 'Story published',
          description: 'Your news story is live for the community.',
          tone: 'success',
        })

        return formatted
      } catch (createError) {
        addToast?.({
          title: 'Unable to publish news',
          description: createError.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw createError
      }
    },
    [addToast]
  )

  return useMemo(
    () => ({ items, loading, error, refresh: fetchNews, createNews }),
    [items, loading, error, fetchNews, createNews]
  )
}

export const useNewsArticle = (id) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

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
        const response = await get(`/news/${id}`, { includeAuth: false })
        if (!isMounted) return
        setData(formatArticle(response?.data ?? null))
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        addToast?.({
          title: 'Unable to load story',
          description: fetchError.message ?? 'Please try again later.',
          tone: 'error',
        })
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
  }, [id, addToast])

  return { data, loading, error }
}

export default useNews
