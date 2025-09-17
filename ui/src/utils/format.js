export function dt(input){
  const d = new Date(input)
  return d.toLocaleString('tr-TR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}
export function money(n){
  const v = Number(n||0)
  return v.toLocaleString('tr-TR', { minimumFractionDigits:2, maximumFractionDigits:2 })
}
export function numberFmt(n){
  return Number(n||0).toLocaleString('tr-TR')
}

export function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })
}
