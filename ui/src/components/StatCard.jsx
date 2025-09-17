export default function StatCard({ icon, label, value }){
  return (
    <div className="stat">
      <div className="n"><i className={`fas ${icon}`} /> {value}</div>
      <div className="l">{label}</div>
    </div>
  )
}
