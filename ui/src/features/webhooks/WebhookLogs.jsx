import React, { useEffect, useState } from 'react'
import './webhooks.css'
import { API } from '../../api/client'
import { dt } from '../../utils/format'

export default function WebhookLogs({ setLoading }) {
  const [logs, setLogs] = useState([])
  const [counts, setCounts] = useState({ s:0, f:0 })

  async function load(){
    try{
      setLoading?.(true)
      const arr = await API.webhookLogs()
      setLogs(arr || [])
      setCounts({
        s: (arr||[]).filter(x=>x.status==='SUCCESS').length,
        f: (arr||[]).filter(x=>x.status==='FAILED').length,
      })
    }finally{ setLoading?.(false) }
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="grid">
      <div className="card">
        <div className="card-head">
          <h3><i className="fas fa-link" /> Webhook Konfigürasyonu</h3>
        </div>
        <div className="form">
          <div className="full">
            <label>Webhook URL (salt okunur)</label>
            <input className="btn" readOnly value="(Sunucu konfigürasyonundan okunur)" />
            <div className="tx-meta" style={{marginTop:6}}>
              <code>webhook.transfer.url</code>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3><i className="fas fa-history" /> Gönderim Geçmişi</h3>
          <div className="helper">
            <span className="badge ok"><i className="fas fa-check" /> {counts.s}</span>
            <span className="badge bad"><i className="fas fa-xmark" /> {counts.f}</span>
            <button className="btn secondary" onClick={load}><i className="fas fa-rotate" /> Yenile</button>
          </div>
        </div>

        <div className="webhook-logs-container">
          {logs.length===0 && <div className="loading-center">Henüz log yok</div>}
          {logs.map(log=>(
            <div key={log.id} className={`webhook-log-item ${String(log.status||'').toLowerCase()}`}>
              <div className="webhook-log-header">
                <div><strong>{log.status}</strong> • {dt(log.createdAt)}</div>
              </div>
              <div className="tx-meta">
                Banka: {log.bankId} • TL: {log.khikTlAccountId} • DTL: {log.khikDtlAccountId}
              </div>
              <div className="tx-meta">
                Tutar: {Number(log.amount||0).toFixed(2)} TRY • Kaynak: {log.source} • TxID: {log.transactionId}
              </div>
              {log.description && <div className="tx-meta">Açıklama: {log.description}</div>}
              {log.errorMessage && <div className="message error" style={{marginTop:8}}>{log.errorMessage}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
