import { useEffect, useState } from 'react'
import { API } from '../../api/client'
import { FAST } from '../../api/transfer'

export default function TransferForm({ setLoading, setMsg }){
  const [bankId, setBankId] = useState('TR330006100519786457841336')
  const [accs, setAccs] = useState([])
  const [khik, setKhik] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')

  useEffect(()=>{
    (async()=> {
      const s = await API.settingsGet().catch(()=>({}))
      if (s?.bankIban) setBankId(s.bankIban)
      const a = await API.accounts().catch(()=>[])
      setAccs(a||[])
    })()
  },[])

  async function submit(){
    const val = Number(amount)
    if (!khik) return setMsg?.({type:'error', text:'Lütfen KHIK TL hesap seçiniz'})
    if (!isFinite(val) || val<=0) return setMsg?.({type:'error', text:'Geçerli tutar giriniz'})
    const payload = {
      xbankId: bankId,
      khikTlAccountId: khik,
      khikDtlAccountId: 'DTL_Hesap_ID',
      amount: val,
      description: desc.trim() || undefined
    }
    try{
      setLoading(true)
      await FAST.transfer(payload)
      setMsg?.({type:'success', text:'FAST transfer talebi gönderildi'})
      setAmount(''); setDesc('')
    }catch(e){ setMsg?.({type:'error', text:e.message}) }
    finally{ setLoading(false) }
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="card-head"><h3><i className="fas fa-sliders" /> Aktarım Parametreleri</h3></div>
        <div className="form">
          <div className="full">
            <label>Banka ID (salt okunur)</label>
            <input className="form-control" value={bankId} readOnly />
          </div>

          <div className="full">
            <label>KHIK TL Hesap</label>
            <div className="select-control">
              <select className="form-control" value={khik} onChange={e=>setKhik(e.target.value)}>
                <option value="" disabled>Hesap seçiniz...</option>
                {accs.map(a=>(
                  <option key={a.accountId} value={a.accountId}>
                    {a.accountName} — {a.accountId} ({Number(a.balance||0).toFixed(2)} TRY)
                  </option>
                ))}
              </select>
            </div>
            <small className="form-text text-muted">Listeden bir TL hesabı seçiniz</small>
          </div>

          <div>
            <label>DTL Hesap ID (salt okunur)</label>
            <input className="form-control" value="DTL_Hesap_ID" readOnly />
          </div>

          <div>
            <label>Tutar (TRY)</label>
            <input className="form-control" type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="örn. 250.75" />
          </div>

          <div className="full">
            <label>Açıklama (opsiyonel)</label>
            <input className="form-control" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Bankadan FAST’e aktarım" />
          </div>

          <div className="full" style={{marginTop:12}}>
            <button className="btn primary" onClick={submit}><i className="fas fa-paper-plane" /> FAST’e Gönder</button>
          </div>
        </div>
      </div>
    </div>
  )
}