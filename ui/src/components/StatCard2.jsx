// Sadece "Toplam Bakiye" için 2 satırlı özel yerleşim
export default function StatCard2({ icon, label, value }){
  return (
    <div className="stat">
      <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center'}}>
        <div className="n" style={{margin:0}}><i className={`fas ${icon}`} /></div>
        <div className="n" style={{margin:0, textAlign:'right'}}>{value}</div>
      </div>
      <div className="l">{label}</div>
    </div>
  )
}
