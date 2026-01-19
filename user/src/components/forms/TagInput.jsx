import { useState } from 'react'

const TagInput = ({ label, values = [], onChange }) => {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (values.includes(trimmed)) {
      setInputValue('')
      return
    }
    onChange?.([...values, trimmed])
    setInputValue('')
  }

  const removeTag = (tag) => {
    onChange?.(values.filter((item) => item !== tag))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Backspace' && !inputValue) {
      removeTag(values[values.length - 1])
    }
  }

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 px-3 py-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] border-none px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          placeholder="Type and press Enter"
        />
      </div>
    </label>
  )
}

export default TagInput
