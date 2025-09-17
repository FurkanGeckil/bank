import { useEffect, useMemo, useState } from 'react'
import { API } from '../../api/client'
import { money, numberFmt } from '../../utils/format'
import StatCard from '../../components/StatCard.jsx'
import StatCard2 from '../../components/StatCard2.jsx'
import TransactionItem from '../../components/TransactionItem.jsx'

export default function Dashboard({ setLoading, setMsg }){
  const [stats, setStats]   = useState({ totalTransactions: 0 })
  const [recent, setRecent] = useState([])
  const [accounts, setAccounts] = useState([])

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
        const s = await API.stats().catch(()=>({ totalTransactions:0 }))
        setStats(s)
        const acc = await API.accounts()
        setAccounts(acc||[])

        // son işlemler (3 hesap x 3 işlem = 9)
        const tmp=[]
        for (const a of (acc||[]).slice(0,3)){
          const tx = await API.accountTx(a.accountId).catch(()=>[])
          tmp.push(...tx.slice(0,3).map(t=>({...t, accountName:a.accountName, accountId:a.accountId})))
        }
        tmp.sort((a,b)=> new Date(b.transactionDate) - new Date(a.transactionDate))
        setRecent(tmp.slice(0,10))
      }catch(e){
        setMsg?.({type:'error', text:'Dashboard yüklenemedi'})
      } finally {
        setLoading?.(false)  
      }
    })()
  },[])

  const totalBalance = useMemo(()=> (accounts||[]).reduce((s,a)=> s + Number(a.balance||0), 0), [accounts])

  return (
    <div className="grid">
      <div className="card">
        <div className="card-head"><h3><i className="fas fa-gauge" /> Genel Bakış</h3></div>
        <div className="stat-grid">
          <StatCard  icon="fa-building-columns" label="Toplam Hesap" value={numberFmt(accounts.length)} />
          <StatCard  icon="fa-list" label="Toplam İşlem" value={numberFmt(stats.totalTransactions)} />
          <StatCard2 icon="fa-sack-dollar" label="Toplam Bakiye" value={`${money(totalBalance)} TRY`} />
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3><i className="fas fa-clock" /> Son İşlemler</h3></div>
        <div className="list">
          {recent.length===0 && <div className="loading-center">Henüz işlem yok</div>}
          {recent.map((t,i)=><TransactionItem key={i} t={t} />)}
        </div>
      </div>
    </div>
  )
}
