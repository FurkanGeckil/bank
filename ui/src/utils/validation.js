export const ibanTR = (s) => /^TR[0-9]{24}$/.test(String(s||'').trim())

export const tcKimlikNo = (s) => {
  const v = String(s||'').trim()
  if(!/^[0-9]{11}$/.test(v)) return false}

export function validateHttpUrl(s) {
  if (typeof s !== 'string') return { ok:false, msg:'URL metin olmalı' }
  let url = s.trim()
  if (!url) return { ok:false, msg:'URL boş olamaz' }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
}
        
export const validateIban = (s) => /^TR[0-9]{24}$/.test(String(s||'').trim())