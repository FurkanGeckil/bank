// src/app/App.jsx
import { useMemo, useRef, useState, useEffect } from 'react'
import './app.css'
import { TABS } from './tabs'

// components
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import Message from '../components/Message.jsx'

// features
import Dashboard from '../features/dashboard/Dashboard.jsx'
import Bank from '../features/bank/Bank.jsx'
import WebhookLogs from '../features/webhooks/WebhookLogs.jsx'
import Transactions from '../features/transactions/Transactions.jsx'
import Settings from '../features/settings/Settings.jsx'
import TransferForm from '../features/transfer/TransferForm.jsx'
import FastTransactions from '../features/fast/FastTransactions.jsx'
import FastTransactions2 from '../features/fast/FastTransactions2.jsx'

export default function App(){
  // >>> değişiklik: sayaç + güvenli setLoading
  const [loadCount, setLoadCount] = useState(0)
  const [msg, setMsg] = useState(null)
  const [active, setActive] = useState('dashboard')
  const timerRef = useRef(null)

  const loading = loadCount > 0

  // Çocuk bileşenlere uyumlu API: setLoading(true/false)
  const setLoading = (v) => {
    setLoadCount(prev => v ? prev + 1 : Math.max(0, prev - 1))
  }

  // Güvenlik şeridi: 15 sn sonra hâlâ açıksa otomatik kapat + uyarı
  useEffect(() => {
    if (loading) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        console.warn('[loader] auto-clear (15s watchdog)')
        setLoadCount(0)
      }, 15000)
    } else {
      clearTimeout(timerRef.current)
    }
    return () => clearTimeout(timerRef.current)
  }, [loading])

  // Debug: tarayıcı konsolundan sayacı görebilin
  useEffect(() => {
    window.__loading = {
      inc: () => setLoading(true),
      dec: () => setLoading(false),
      get count(){ return loadCount }
    }
  }, [loadCount])

  const tabCmp = useMemo(()=>{
    const common = { setLoading, setMsg }
    switch(active){
      case 'dashboard':        return <Dashboard {...common} />
      case 'accounts':         return <Bank {...common} />
      case 'webhooks':         return <WebhookLogs {...common} />
      case 'transactions':     return <Transactions {...common} />
      case 'settings':         return <Settings {...common} />
      case 'fastRemit':        return <TransferForm {...common} />
      case 'fastTransactions': return <FastTransactions {...common} />
      case 'fastTransactions2':return <FastTransactions2 {...common} />
      default:                 return <Dashboard {...common} />
    }
  }, [active])

  return (
    <div className="app-wrap">
      <header className="header">
        <div>
          <h1><i className="fas fa-university" /> XXX Bank Module</h1>
          <p className="subtitle">XXX Bank Management Dashboard</p>
        </div>
      </header>

      <nav className="nav">
        {TABS.map(t=>(
          <button
            key={t.id}
            className={active===t.id ? 'active' : ''}
            onClick={()=>setActive(t.id)}
            title={t.label}
          >
            <i className={`fas ${t.icon}`} /> {t.label}
          </button>
        ))}
      </nav>

      <div className="grid">
        {msg && <Message type={msg.type} onClose={()=>setMsg(null)}>{msg.text}</Message>}
        {tabCmp}
      </div>

      <LoadingOverlay show={loading} />
    </div>
  )
}
