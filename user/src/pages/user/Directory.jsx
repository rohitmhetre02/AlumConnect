import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserDirectoryFilter from '../../components/user/directory/UserDirectoryFilter'
import UserDirectoryCard from '../../components/user/directory/UserDirectoryCard'
import { useDirectoryData } from '../../hooks/useDirectoryData'

const FILTER_DEFINITIONS = {
  students: {
    defaults: {
      location: '',
      classYears: [],
      departments: [],
      interests: [],
    },
    sections: [
      {
        key: 'classYears',
        label: 'Class Year',
        description: 'Spot first-year peers or final-year leaders.',
        variant: 'pill',
        accent: 'dark',
        accessor: (profile) => profile.classYear,
      },
        {
        key: 'departments',
        label: 'Department',
        description: 'Filter by academic discipline or program.',
        variant: 'pill',
        accessor: (profile) => profile.department,
      },
      {
        key: 'interests',
        label: 'Focus Areas',
        description: 'Highlight interests to find collaborators.',
        variant: 'checkbox',
        layout: 'grid',
        accessor: (profile) => profile.interests ?? [],
      },
    ],
    locationPlaceholder: 'e.g. Mumbai, Remote campus',
  },
  alumni: {
    defaults: {
      location: '',
      industries: [],
      graduationYears: [],
      involvement: [],
    },
    sections: [
      {
        key: 'industries',
        label: 'Industry',
        description: 'Connect with leaders across sectors.',
        variant: 'pill',
        accessor: (profile) => profile.industry,
      },
      {
        key: 'graduationYears',
        label: 'Graduation Year',
        description: 'Find alumni from your cohort.',
        variant: 'pill',
        accent: 'dark',
        accessor: (profile) => (profile.graduationYear ? String(profile.graduationYear) : null),
      },
      {
        key: 'involvement',
        label: 'Community Involvement',
        description: 'Identify ambassadors, mentors, and chapter leads.',
        variant: 'checkbox',
        layout: 'grid',
        accessor: (profile) => profile.involvement ?? [],
      },
    ],
    locationPlaceholder: 'e.g. Singapore, Dubai chapter',
  },
  faculty: {
    defaults: {
      location: '',
      departments: [],
      researchAreas: [],
      availability: [],
    },
    sections: [
      {
        key: 'departments',
        label: 'Department',
        description: 'Browse faculty across schools and disciplines.',
        variant: 'pill',
        accessor: (profile) => profile.department,
      },
      {
        key: 'researchAreas',
        label: 'Research Focus',
        description: 'Match mentors by research expertise.',
        variant: 'checkbox',
        layout: 'grid',
        accessor: (profile) => profile.researchAreas ?? [],
      },
      {
        key: 'availability',
        label: 'Availability',
        description: 'Discover who is open to mentoring or collaboration.',
        variant: 'pill',
        accessor: (profile) => profile.availability,
      },
    ],
    locationPlaceholder: 'e.g. Delhi campus, Remote',
  },
}

const createDefaultFilters = (role) => {
  const definition = FILTER_DEFINITIONS[role]
  if (!definition) return {}
  return Object.entries(definition.defaults).reduce((acc, [key, value]) => {
    acc[key] = Array.isArray(value) ? [] : ''
    return acc
  }, {})
}

const roleLabels = {
  students: 'Student Directory',
  alumni: 'Alumni Directory',
  faculty: 'Faculty Directory',
}

const resolveRoleFromPath = (pathname = '') => {
  if (pathname.endsWith('/alumni')) return 'alumni'
  if (pathname.endsWith('/faculty')) return 'faculty'
  return 'students'
}

const Directory = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState(() => resolveRoleFromPath(location.pathname))
  const baseFilters = useMemo(() => createDefaultFilters(role), [role])
  const [filters, setFilters] = useState(baseFilters)

  const { loading, members = [], error } = useDirectoryData(role)

  // Get current user info for filtering
  const currentUserId = user?.id || user?._id
  const currentUserRole = user?.role?.toLowerCase()

  useEffect(() => {
    const nextRole = resolveRoleFromPath(location.pathname)
    setRole(nextRole)
  }, [location.pathname])

  useEffect(() => {
    setFilters(baseFilters)
  }, [baseFilters])

  const filterDefinition = useMemo(() => FILTER_DEFINITIONS[role] ?? null, [role])

  const filterOptions = useMemo(() => {
    if (!filterDefinition) {
      return { sections: [], locationPlaceholder: 'Filter by city or campus' }
    }
    if (!Array.isArray(members) || !members.length) {
      return { sections: [], locationPlaceholder: filterDefinition.locationPlaceholder }
    }
    const roleProfiles = members.filter((profile) => profile.role === role)
    const sections = filterDefinition.sections
      .map((section) => {
        const values = new Set()
        roleProfiles.forEach((profile) => {
          const source = section.accessor(profile)
          if (Array.isArray(source)) {
            source.filter(Boolean).forEach((item) => values.add(item))
          } else if (source) {
            values.add(source)
          }
        })
        if (!values.size) return null
        return {
          key: section.key,
          label: section.label,
          description: section.description,
          variant: section.variant,
          layout: section.layout,
          accent: section.accent,
          options: Array.from(values)
            .sort((a, b) => String(a).localeCompare(String(b)))
            .map((value) => ({ value, label: value })),
        }
      })
      .filter(Boolean)

    return {
      sections,
      locationPlaceholder: filterDefinition.locationPlaceholder,
    }
  }, [filterDefinition, members, role])

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase()
    const locationFilter = filters?.location?.toLowerCase?.() ?? ''
    const arrayFilter = (key) => {
      const value = filters?.[key]
      return Array.isArray(value) ? value : []
    }

    return members.filter((profile) => {
      if (profile.role !== role) return false
      
      // Exclude current user from their own role directory
      if (currentUserId && currentUserRole === role && profile.id === currentUserId) {
        return false
      }
      
      const searchableValues = [profile.name, profile.program, profile.title, profile.location]
        .filter(Boolean)
        .map((value) => value.toLowerCase())
      const matchesSearch = query ? searchableValues.some((value) => value.includes(query)) : true
      if (!matchesSearch) return false

      if (locationFilter) {
        const profileLocation = profile.location?.toLowerCase() ?? ''
        if (!profileLocation.includes(locationFilter)) return false
      }

      if (role === 'students') {
        const classYears = arrayFilter('classYears')
        const departments = arrayFilter('departments')
        const interestsFilter = arrayFilter('interests')

        if (classYears.length && !classYears.includes(profile.classYear)) return false
        if (departments.length && !departments.includes(profile.department)) return false
        if (interestsFilter.length) {
          const interests = profile.interests ?? []
          if (!interestsFilter.some((item) => interests.includes(item))) return false
        }
      }

      if (role === 'alumni') {
        const industries = arrayFilter('industries')
        const graduationYears = arrayFilter('graduationYears')
        const involvement = arrayFilter('involvement')

        if (industries.length && !industries.includes(profile.industry)) return false
        if (graduationYears.length) {
          const year = profile.graduationYear ? String(profile.graduationYear) : null
          if (!year || !graduationYears.includes(year)) return false
        }
        if (involvement.length) {
          const profileInvolvement = profile.involvement ?? []
          if (!involvement.some((item) => profileInvolvement.includes(item))) return false
        }
      }

      if (role === 'faculty') {
        const departments = arrayFilter('departments')
        const researchAreasFilter = arrayFilter('researchAreas')
        const availabilityFilter = arrayFilter('availability')

        if (departments.length && !departments.includes(profile.department)) return false
        if (researchAreasFilter.length) {
          const researchAreas = profile.researchAreas ?? []
          if (!researchAreasFilter.some((item) => researchAreas.includes(item))) return false
        }
        if (availabilityFilter.length) {
          const availability = profile.availability ?? []
          const availabilityList = Array.isArray(availability) ? availability : [availability]
          if (!availabilityFilter.some((item) => availabilityList.includes(item))) return false
        }
      }

      return true
    })
  }, [members, role, search, filters, currentUserId, currentUserRole])

  const handleSearchChange = (value) => {
    setSearch(value)
  }

  const handleRoleChange = (nextRole) => {
    if (nextRole === role) return
    setRole(nextRole)
    setSearch('')
    setFilters(createDefaultFilters(nextRole))
    const nextPath = nextRole === 'students' ? '/dashboard/directory' : `/dashboard/directory/${nextRole}`
    if (location.pathname !== nextPath) {
      navigate(nextPath, { replace: true })
    }
  }

  const handleOpenProfile = (person) => {
    navigate(`/dashboard/directory/profile/${person.id}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{roleLabels[role] ?? 'Directory'}</h1>
          <p className="text-sm text-slate-500">Browse and connect with fellow community members.</p>
        </div>
        <UserDirectoryFilter
          search={search}
          role={role}
          filters={filters}
          filterOptions={filterOptions}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
          onFiltersChange={setFilters}
          defaultFiltersFactory={() => createDefaultFilters(role)}
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm text-slate-500">Loading directory…</p>
        </div>
      ) : error ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-500">Failed to load directory. Please try again later.</p>
        </div>
      ) : filteredProfiles.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProfiles.map((profile) => (
            <UserDirectoryCard key={profile.id} person={profile} onOpen={handleOpenProfile} />
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm text-slate-500">
            {currentUserId && currentUserRole === role 
              ? `No other ${role.slice(0, -1)}s found matching the selected filters.` 
              : 'No members match the selected filters.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
export default Directory

const initialFilters = {}
