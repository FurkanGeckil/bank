import React from 'react'

/** Basit bir makbuz görünümlü blok */
export default function Receipt({ rows = [] }) {
  return (
    <div className="receipt">
      {rows.map((r, i) => (
        <div key={i} style={{display:'grid', gridTemplateColumns:'160px 1fr', gap:8}}>
          <strong>{r.label}</strong>
          <span>{r.value}</span>
        </div>
      ))}
    </div>
  )
}
