const PRIMARY_DEPARTMENTS = [
  'Civil Engineering',
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication Engineering',
  'Mechanical Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics Engineering (VLSI Design And Technology)',
  'Electronics & Communication (Advanced Communication Technology)',
  'School of Architecture',
]

const DEPARTMENT_ALIASES = {
  civil: 'Civil Engineering',
  'civil engineering': 'Civil Engineering',
  computer: 'Computer Engineering',
  'computer engineering': 'Computer Engineering',
  cse: 'Computer Engineering',
  it: 'Information Technology',
  'information technology': 'Information Technology',
  entc: 'Electronics & Telecommunication Engineering',
  ece: 'Electronics & Telecommunication Engineering',
  'electronics & telecommunication engineering': 'Electronics & Telecommunication Engineering',
  'electronics and telecommunication engineering': 'Electronics & Telecommunication Engineering',
  mechanical: 'Mechanical Engineering',
  'mechanical engineering': 'Mechanical Engineering',
  aids: 'Artificial Intelligence & Data Science',
  'artificial intelligence & data science': 'Artificial Intelligence & Data Science',
  'artificial intelligence and data science': 'Artificial Intelligence & Data Science',
  vlsi: 'Electronics Engineering (VLSI Design And Technology)',
  'electronics engineering (vlsi design and technology)': 'Electronics Engineering (VLSI Design And Technology)',
  communication: 'Electronics & Communication (Advanced Communication Technology)',
  'electronics & communication (advanced communication technology)': 'Electronics & Communication (Advanced Communication Technology)',
  'electronics and communication (advanced communication technology)': 'Electronics & Communication (Advanced Communication Technology)',
  soa: 'School of Architecture',
  'school of architecture': 'School of Architecture',
}

const normalizeDepartmentKey = (value) => {
  if (!value) return ''
  return String(value).trim().toLowerCase()
}

const normalizeDepartment = (value) => {
  if (!value) return ''
  const keyed = normalizeDepartmentKey(value)
  if (DEPARTMENT_ALIASES[keyed]) {
    return DEPARTMENT_ALIASES[keyed]
  }

  const titleCased = String(value)
    .trim()
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ')

  return titleCased
}

const getDepartmentOptions = () => {
  const options = new Set(PRIMARY_DEPARTMENTS)
  Object.values(DEPARTMENT_ALIASES).forEach((label) => options.add(label))
  return Array.from(options)
}

module.exports = {
  PRIMARY_DEPARTMENTS,
  DEPARTMENT_ALIASES,
  normalizeDepartment,
  getDepartmentOptions,
}
