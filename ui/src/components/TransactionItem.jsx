import { dt, money } from '../utils/format'

export default function TransactionItem({ t, onDelete }){
  const bank = t.xBankId || t.bankId || ''
  const date = t.transactionDate || t.createdAt
  const canDelete = typeof onDelete === 'function'

  return (
    <div className="tx-item">
      <div className="tx-left">
        <div className="tx-title">Banka: {bank}</div>
        <div className="tx-meta">{dt(date)} • {t.status || '—'}</div>
        {t.description && <div className="tx-meta">Açıklama: {t.description}</div>}
      </div>

      <div className="tx-right" style={{display:'flex', alignItems:'center', gap:10}}>
        <div className="tx-amount">{money(Number(t.amount||0))} <span className="currency">TRY</span></div>
        {canDelete && (
          <button className="btn" onClick={()=>onDelete(t.id)} title="Sil">
            <i className="fas fa-trash" />
          </button>
        )}
      </div>
    </div>
  )
}
