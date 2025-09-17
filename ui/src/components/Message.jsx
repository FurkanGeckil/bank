export default function Message({ type='info', children, onClose }){
  return (
    <div className={`message ${type}`}>
      {children}
      {onClose && (
        <button onClick={onClose} className="btn" style={{marginLeft:8}}>Kapat</button>
      )}
    </div>
  )
}
