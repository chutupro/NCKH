import React, { useEffect, useRef, useState } from 'react'

const CustomSelect = ({ value, options = [], onChange, placeholder = 'Select' }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const current = options.find(o => o.value === value)

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(s => !s)
    }
  }

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className="custom-select-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(s => !s)}
        onKeyDown={handleKeyDown}
      >
        <span className="custom-select-value">{current ? current.label : placeholder}</span>
        <span className="custom-select-arrow" aria-hidden>▾</span>
      </button>

      {open && (
        <ul role="listbox" tabIndex={-1} className="custom-select-list">
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-select-item ${opt.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { onChange(opt.value); setOpen(false) } }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CustomSelect
