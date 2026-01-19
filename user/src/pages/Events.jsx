import { useEffect, useState } from 'react'
import PublicEventCard from '../components/events/PublicEventCard'
import Pagination from '../components/ui/Pagination'
import { SkeletonCard } from '../components/ui/Skeleton'
import useEvents from '../hooks/useEvents'

const PAGE_SIZE = 6

const Events = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [events, setEvents] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { listEvents } = useEvents()

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)

    const fetchEvents = async () => {
      try {
        const result = await listEvents()
        if (isCancelled) return
        
        if (result.success) {
          const allEvents = result.data
          const totalPages = Math.max(1, Math.ceil(allEvents.length / PAGE_SIZE))
          const start = (currentPage - 1) * PAGE_SIZE
          const items = allEvents.slice(start, start + PAGE_SIZE)
          
          setEvents(items)
          setTotalPages(totalPages)
        }
      } catch (err) {
        console.error('Failed to fetch events:', err)
        if (!isCancelled) {
          setEvents([])
          setTotalPages(1)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchEvents()

    return () => {
      isCancelled = true
    }
  }, [currentPage, listEvents])

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Community</p>
          <h1 className="text-4xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500">Discover upcoming experiences hosted by AlumConnect network.</p>
        </div>
        <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          View All Events
        </button>
      </header>

      {isLoading && events.length === 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <PublicEventCard key={event.id} event={event} />
          ))}
        </section>
      )}

      <div className="flex justify-center">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

export default Events
