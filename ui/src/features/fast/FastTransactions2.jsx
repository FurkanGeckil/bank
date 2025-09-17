import { useEffect, useMemo, useState } from 'react'
import './fast.css'
import { FAST } from '../../api/transfer'
import { API } from '../../api/client'

function hhmm(dateLike) {
  const d = new Date(dateLike)
  return d.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })
}

export default function FastTransactions2({ setLoading, setMsg }) {
  const [khikList, setKhikList] = useState([])         // dropdown için KHIK hesapları
  const [selectedKhik, setSelectedKhik] = useState('') // ""=Tümü
  const [start, setStart] = useState('')               // yyyy-mm-dd
  const [end, setEnd] = useState('')                   // yyyy-mm-dd
  const [rows, setRows] = useState([])

  useEffect(() => {
    // KHIK hesapları (bank/list)
    (async ()=>{
      try {
        const accs = await API.accounts()
        setKhikList(accs || [])
      } catch {}
    })()
    load()
  }, [])

  async function load(){
    try {
      setLoading?.(true)
      const list = await FAST.listTransactions({ start, end })
      setRows(Array.isArray(list) ? list : [])
    } catch (e) {
      setMsg?.({ type:'error', text: e?.message || String(e) })
    } finally {
      setLoading?.(false)
    }
  }

  // Filtre: sadece KHIK’lerde olanlar + seçili KHIK varsa ona göre
  const filtered = useMemo(()=>{
    const khikSet = new Set(khikList.map(a => a.accountId))
    return rows
      .filter(t => khikSet.has(t.khikTlAccountId || t.accountId))
      .filter(t => !selectedKhik || (t.khikTlAccountId || t.accountId) === selectedKhik)
      .sort((a,b)=> new Date(b.transactionDate||b.createdAt) - new Date(a.transactionDate||a.createdAt))
  }, [rows, khikList, selectedKhik])

  // KHIK bazında grupla
  const groups = useMemo(()=>{
    const m = new Map()
    for (const t of filtered) {
      const k = t.khikTlAccountId || t.accountId
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(t)
    }
    return m
  }, [filtered])

  return (
    <div className="grid">
      <div className="section-header" style={{ gap:10, flexWrap:'wrap' }}>
        <select
          className="form-control"
          value={selectedKhik}
          onChange={e=>setSelectedKhik(e.target.value)}
          style={{minWidth:280}}
        >
          <option value="">Tümü (tüm KHIK hesapları)</option>
          {khikList.map(a => (
            <option key={a.accountId} value={a.accountId}>
              {a.accountName} — {a.accountId}
            </option>
          ))}
        </select>

        <input type="date" className="form-control" title="Başlangıç" value={start} onChange={e=>setStart(e.target.value)} />
        <input type="date" className="form-control" title="Bitiş"     value={end}   onChange={e=>setEnd(e.target.value)} />

        <button className="btn" onClick={load}>
          <i className="fas fa-magnifying-glass" /> Ara
        </button>
        <button className="btn secondary" onClick={() => { setStart(''); setEnd(''); setSelectedKhik(''); load() }}>
          <i className="fas fa-rotate" /> Yenile
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <h3><i className="fas fa-list" /> KHIK Bazında İşlem Listeleri</h3>
        </div>
        <div className="card-body" id="fast2List">
          {[...groups.entries()].map(([khik, list]) => (
            <div key={khik} className="card" style={{ marginBottom:12 }}>
              <div className="card-head">
                <h3><i className="fas fa-building-columns" /> KHIK: {khik}</h3>
              </div>
              <div className="card-body" style={{ maxHeight: 360, overflowY:'auto' }}>
                {list.map((t, i) => (
                  <div key={i} className="tx-item" style={{alignItems:'start'}}>
                    <div>
                      <div className="tx-meta"><strong>khik_ID:</strong> {t.khikTlAccountId || t.accountId}</div>
                      <div className="tx-meta"><strong>Miktar:</strong> {(Number(t.amount||0)).toFixed(2)} TRY</div>
                      <div className="tx-meta"><strong>Saat:</strong> {hhmm(t.transactionDate||t.createdAt)}</div>
                      {t.description && <div className="tx-meta"><strong>Açıklama:</strong> {t.description}</div>}
                    </div>
                  </div>
                ))}
                {list.length===0 && <div className="loading-center">Kayıt yok</div>}
              </div>
            </div>
          ))}
          {groups.size===0 && <div className="loading-center">Kayıt yok</div>}
        </div>
      </div>
    </div>
  )
}
