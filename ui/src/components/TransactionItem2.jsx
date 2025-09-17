import { dt, money } from '../utils/format'

export default function TransactionItem2({ t }){
  return (
    <div className="tx-item" style={{
      background: 'linear-gradient(135deg, #9AB8BF 0%, #4F4F4F 100%)',
      color:'#fff', border:'none'
    }}>
      <div>
        <div style={{fontWeight:800}}>{t.khikTlAccountId || t.accountId}</div>
        <div style={{opacity:.9}}>{dt(t.transactionDate || t.createdAt)}</div>
        {t.description && <div style={{opacity:.95, fontWeight:700}}>{t.description}</div>}
      </div>
      <div style={{fontWeight:900}}>{money(Number(t.amount||0))} <span style={{opacity:.9}}>TRY</span></div>
    </div>
  )
}
