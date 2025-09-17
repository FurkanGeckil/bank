import { useEffect, useState } from 'react'
import './fast.css'
import { FAST } from '../../api/transfer'
import { API } from '../../api/client'
import { money, dt } from '../../utils/format'
import Message from '../../components/Message.jsx'

export default function FastTransactions({ setLoading }) {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [bankIban, setBankIban] = useState('')
  const [khikIban, setKhikIban] = useState('')
  const [err, setErr] = useState(null)

  useEffect(() => { load() }, [])
  async function load(){
    try{
      setErr(null)
      setLoading?.(true)
      const list = await FAST.listTransactions()
      setRows(Array.isArray(list)? list: [])
      // header bank iban
      try { const s = await API.settingsGet(); setBankIban(s.bankIban||'') } catch{}
    }catch(e){ setErr(e?.message || String(e)) }
    finally{ setLoading?.(false) }
  }

  const filtered = rows
    .filter(t=>{
      if (!q.trim()) return true
      const xb = (t.xBankId || t.bankId || '').toLowerCase()
      return xb.includes(q.trim().toLowerCase())
    })
    .sort((a,b)=> new Date(b.transactionDate||b.createdAt) - new Date(a.transactionDate||a.createdAt))

  const summary = {
    count: filtered.length,
    sum: filtered.reduce((s,t)=> s + Number(t.amount||0), 0),
  }

  const groups = {}
  for (const t of filtered) {
    const k = t.khikTlAccountId || t.accountId || 'Bilinmiyor'
    groups[k] ??= []
    groups[k].push(t)
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="section-header" style={{gap:12, alignItems:'flex-end', flexWrap:'wrap', display:'flex'}}>
          <div className="form-group" style={{minWidth:280}}>
            <label><i className="fas fa-credit-card" /> Banka IBAN</label>
            <input className="btn" readOnly value={bankIban} placeholder="—" />
          </div>
          <div className="form-group" style={{minWidth:280}}>
            <label><i className="fas fa-building-columns" /> KHIK Hesap IBAN</label>
            <input className="btn" readOnly value={khikIban} placeholder="Tümü" />
          </div>
          <div className="helper" style={{marginLeft:'auto', gap:8}}>
            <input className="btn" placeholder="Banka ID ile filtrele" value={q} onChange={e=>setQ(e.target.value)} />
            <button className="btn secondary" onClick={load}><i className="fas fa-rotate" /> Yenile</button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3><i className="fas fa-list" /> Tüm FAST İşlemleri</h3>
            <div className="helper">
              <span className="badge info"><i className="fas fa-hashtag" /> Toplam İşlem: {summary.count}</span>
              <span className="badge ok"><i className="fas fa-sack-dollar" /> Toplam Tutar: {money(summary.sum)}</span>
            </div>
          </div>

          {err && <Message type="error">{err}</Message>}

          <div id="fastTxList">
            {Object.entries(groups).map(([khik, list]) => (
              <div key={khik} className="fast-khik-group card" style={{marginBottom:12}}>
                <div className="card-head">
                  <h3><i className="fas fa-building-columns" /> KHIK: {khik}</h3>
                  <div className="helper">
                    <span className="badge info"><i className="fas fa-hashtag" /> İşlem: {list.length}</span>
                    <span className="badge ok"><i className="fas fa-sack-dollar" /> Tutar: {money(list.reduce((s,t)=>s+Number(t.amount||0),0))}</span>
                    <button className="btn" onClick={()=>setKhikIban(khik)}><i className="fas fa-arrow-right" /> Seç</button>
                  </div>
                </div>
                <div className="card-body fast-khik-items">
                  {(list||[]).map((t,i)=>(
                    <div key={i} className="tx-item">
                      <div className="tx-left">
                        <div className="tx-title">Banka: {t.xBankId || t.bankId || 'N/A'}</div>
                        <div className="tx-meta">{dt(t.transactionDate||t.createdAt)}</div>
                        {t.description && <div className="tx-meta">Açıklama: {t.description}</div>}
                      </div>
                      <div className="tx-right">
                        <div className="tx-amount">{money(Number(t.amount||0))} <span className="currency">TRY</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length===0 && <div className="loading-center">Kayıt yok</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
