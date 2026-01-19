import { useState, useEffect } from 'react'
import MentorCard from '../components/home/MentorCard'
import EventCard from '../components/home/EventCard'
import StatCard from '../components/home/StatCard'
import useEvents from '../hooks/useEvents'

const stats = [
  {
    title: 'Total Alumni',
    value: '12,500+',
    icon: '👥',
    iconClass: 'bg-soft-purple/60 text-primary',
  },
  {
    title: 'Students Connected',
    value: '4,200+',
    icon: '🎓',
    iconClass: 'bg-soft-green/80 text-emerald-600',
  },
  {
    title: 'Mentorship Sessions',
    value: '1,800+',
    icon: '💡',
    iconClass: 'bg-soft-purple/60 text-purple-600',
  },
  {
    title: 'Events Hosted',
    value: '350+',
    icon: '📅',
    iconClass: 'bg-soft-yellow text-amber-600',
  },
]

const mentors = [
  {
    name: 'Shiri Agarwal',
    role: 'Product @ TechLabs',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'Shubham Kumar',
    role: 'Marketing @ Vive India',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'Palak Gupta',
    role: 'Analyst @ Accentra',
    rating: 4.7,
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    name: 'Dhananjay Shah',
    role: 'Manager @ Commerz',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=64',
  },
]

const Home = () => {
  const [events, setEvents] = useState([])
  const { items: eventItems, loading: eventsLoading, refresh } = useEvents()

  useEffect(() => {
    setEvents(eventItems.slice(0, 3))
  }, [eventItems])

  useEffect(() => {
    refresh()
  }, [refresh])
  return (
    <div className="space-y-16">
      <section className="grid gap-10 rounded-3xl bg-white p-10 shadow-soft lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Community-first</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-900">
            Connecting Students,
            <br />
            <span className="text-transparent bg-gradient-to-r from-primary to-primary-dark bg-clip-text">
              Alumni &amp; Faculty
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Join the ultimate network to foster relationships, share knowledge, and build careers. Reconnect with your alma mater today.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Get Started
            </button>
            <button className="rounded-full border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Learn More
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-80 w-full max-w-md rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <span className="text-lg font-semibold">University students</span>
              <p className="text-sm text-slate-500">Hero image placeholder</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-soft">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Top Mentors</h2>
          <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            View All Mentors
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.name} mentor={mentor} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-soft">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Upcoming Events</h2>
          <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            View All Events
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {eventsLoading ? (
            // Loading skeleton for events
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 w-full bg-slate-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
