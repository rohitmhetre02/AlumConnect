import PublicMentorCard from '../components/mentorship/PublicMentorCard'

const mentors = [
  {
    name: 'Shiri Agarwal',
    role: 'Product Lead',
    company: 'TechLabs',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'Shubham Kumar',
    role: 'Marketing Strategist',
    company: 'Vive India',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'Palak Gupta',
    role: 'Data Analyst',
    company: 'Accentra',
    rating: 4.7,
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    name: 'Dhananjay Shah',
    role: 'Manager',
    company: 'Commerz',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=64',
  },
  {
    name: 'Ananya Patel',
    role: 'UX Researcher',
    company: 'Nova Labs',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
  {
    name: 'Kabir Mehta',
    role: 'AI Engineer',
    company: 'Synapse',
    rating: 4.7,
    avatar: 'https://i.pravatar.cc/150?img=66',
  },
]

const Mentorship = () => {
  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Programs</p>
          <h1 className="text-4xl font-bold text-slate-900">Top Mentors</h1>
          <p className="text-slate-500">Connect with experts ready to guide students and alumni.</p>
        </div>
        <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          View All Mentors
        </button>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mentors.map((mentor) => (
          <PublicMentorCard key={mentor.name} mentor={mentor} />
        ))}
      </section>
    </div>
  )
}

export default Mentorship
