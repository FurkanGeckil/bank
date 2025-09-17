import React from 'react'

export default function SearchBox({ value, onChange, placeholder = 'Ara…' }) {
  return (
    <input
      className="btn"
      value={value}
      onChange={(e)=>onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{ width:'260px' }}
    />
  )
}
