// src/components/LoadingOverlay.jsx
import './loading-overlay.css'

export default function LoadingOverlay({ show = false, text = 'İşlem yapılıyor...' }) {
  return (
    <div
      className="loading-overlay"
      style={{ display: show ? 'flex' : 'none' }}
      aria-hidden={!show}
    >
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin" />
        <p>{text}</p>
      </div>
    </div>
  )
}
