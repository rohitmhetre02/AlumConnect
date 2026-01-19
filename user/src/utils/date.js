const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short' })
const FULL_DATE_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const TIME_FORMAT = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const DAY_NAME_FORMAT = new Intl.DateTimeFormat('en-US', { weekday: 'long' })

const toDate = (value) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value) => {
  const date = toDate(value)
  if (!date) return ''
  return FULL_DATE_FORMAT.format(date)
}

export const formatTime = (value) => {
  if (!value) return ''
  const [hour = '0', minute = '0'] = value.split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0, 0)
  return TIME_FORMAT.format(date)
}

export const formatEventDateRange = (start, end) => {
  const startDate = toDate(start)
  const endDate = toDate(end)

  if (!startDate && !endDate) return ''
  if (startDate && !endDate) return formatDate(startDate)
  if (!startDate && endDate) return formatDate(endDate)

  const sameDay = startDate.toDateString() === endDate.toDateString()
  if (sameDay) {
    const startTime = TIME_FORMAT.format(startDate)
    const endTime = TIME_FORMAT.format(endDate)
    return `${FULL_DATE_FORMAT.format(startDate)} • ${startTime} - ${endTime}`
  }

  const sameMonth = startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()
  if (sameMonth) {
    const month = MONTH_FORMAT.format(startDate)
    return `${month} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`
  }

  return `${FULL_DATE_FORMAT.format(startDate)} - ${FULL_DATE_FORMAT.format(endDate)}`
}

export const getDayName = (value) => {
  const date = toDate(value)
  if (!date) return ''
  return DAY_NAME_FORMAT.format(date)
}
