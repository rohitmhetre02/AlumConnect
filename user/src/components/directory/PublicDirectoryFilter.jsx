import { useState } from 'react'

const categories = ['Students', 'Alumni', 'Faculty']
const departments = ['Engineering', 'Business', 'Design', 'Sciences']
const batchYears = ['2025', '2024', '2023', '2022']

const PublicDirectoryFilter = ({ onFilter }) => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [department, setDepartment] = useState('')
  const [batch, setBatch] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onFilter?.({ search, category, department, batch })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft md:flex-row md:items-end"
      aria-label="Directory filters"
    >
      <label className="flex-1 text-sm font-medium text-slate-700">
        <span className="sr-only">Search directory</span>
        <input
          type="text"
          placeholder="Search alumni, students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex-1 text-sm font-medium text-slate-700">
        <span className="text-xs uppercase tracking-widest text-slate-400">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none"
        >
          <option value="">All</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex-1 text-sm font-medium text-slate-700">
        <span className="text-xs uppercase tracking-widest text-slate-400">Department</span>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none"
        >
          <option value="">All</option>
          {departments.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex-1 text-sm font-medium text-slate-700">
        <span className="text-xs uppercase tracking-widest text-slate-400">Batch Year</span>
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none"
        >
          <option value="">All</option>
          {batchYears.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Apply
      </button>
    </form>
  )
}

export default PublicDirectoryFilter
