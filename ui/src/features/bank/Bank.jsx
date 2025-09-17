import { useEffect, useState } from 'react'
import { API } from '../../api/client'
import { money } from '../../utils/format'
import { FAST } from '../../api/transfer'

const FAST_DTL_ACCOUNT_ID = 'DTL_ACC_ID'

export default function Bank({ setLoading, setMsg }){
  const [items, setItems] = useState([])

  async function load(){
    try{
      setLoading(true)
      const arr = await API.accounts()
      setItems(arr||[])
    }catch(e){
      setMsg?.({type:'error', text:'Hesaplar yüklenemedi'})
    }finally{ setLoading(false) }
  }
  useEffect(()=>{ load() }, [])

  async function remove(accountId){
    if (!confirm('Hesabı silmek istiyor musunuz?')) return
    try{
      setLoading(true)
      await API.accountDelete(accountId)
      setItems(prev=> prev.filter(x=>x.accountId!==accountId))
      setMsg?.({type:'success', text:'Hesap silindi'})
    }catch(e){
      setMsg?.({type:'error', text:e.message})
    }finally{ setLoading(false) }
  }

  async function fastFromCard(acc){
    const bal = Number(acc.balance||0)
    if (!bal || bal<=0) return
    if (!confirm(`${acc.accountId} hesabındaki ${money(bal)} TRY FAST’e aktarılsın mı?`)) return
    try{
      setLoading(true)
      const settings = await API.settingsGet().catch(()=>({}))
      const payload = {
        xBankId: settings.bankIban || '',
        khikTlAccountId: acc.accountId,
        khikDtlAccountId: FAST_DTL_ACCOUNT_ID,
        amount: bal
      }
      await FAST.transfer(payload)
      setMsg?.({type:'success', text:`FAST transfer talebi ${FAST.getBase()} adresine gönderildi.`})
    }catch(e){
      setMsg?.({type:'error', text:e.message})
    }finally{ setLoading(false) }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="card-head">
          <h3><i className="fas fa-credit-card" /> Hesap Yönetimi</h3>
          <button className="btn" onClick={()=>alert('Modal: Yeni Hesap (örnek)')}>
            <i className="fas fa-plus" /> Yeni Hesap
          </button>
        </div>

        <div className="accounts-grid">
          {items.length===0 && <div className="loading-center">Hesap yok</div>}
          {items.map(acc=>(
            <div key={acc.accountId} className="account-card">
              <div className="account-header">
                <div className="account-name">{acc.accountName}</div>
                <div className="account-id">IBAN: {acc.accountId}</div>
              </div>
              <div className="account-balance">{money(acc.balance)} TRY</div>
              <div className="account-actions">
                <button className="btn secondary" onClick={()=>remove(acc.accountId)}>
                  <i className="fas fa-trash" /> Sil
                </button>
                <button className="btn primary" disabled={!(Number(acc.balance||0)>0)} onClick={()=>fastFromCard(acc)}>
                  <i className="fas fa-paper-plane" /> FAST’e Aktar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
