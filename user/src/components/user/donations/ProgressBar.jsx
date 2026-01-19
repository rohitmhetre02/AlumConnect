import { useEffect, useState } from 'react'

const ProgressBar = ({ value }) => {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(value), 150)
    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div className="h-3 rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-green-500 transition-all duration-500"
        style={{ width: `${width}%` }}
      ></div>
    </div>
  )
}

export default ProgressBar
