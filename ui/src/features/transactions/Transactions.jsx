import { useEffect, useState } from 'react';
import { API } from '../../api/client';
import TransactionItem from '../../components/TransactionItem.jsx';
import './transactions.css';

export default function Transactions({ setLoading, setMsg }) {
  const [rows, setRows] = useState([]);

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      setLoading?.(true);
      const data = await API.transactionsByTc(); // { tcTransactions, tcTotalAmounts }
      const all = [];
      Object.entries(data?.tcTransactions || {}).forEach(([tc, list]) => {
        (list || []).forEach(t => all.push({ ...t, tcId: tc }));
      });
      all.sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt));
      setRows(all);
    } catch (e) {
      setMsg?.({ type: 'error', text: e.message });
    } finally { setLoading?.(false); }
  }

  return (
    <div className="card">
      <div className="card-head"><h3><i className="fas fa-list" /> TC ID Bazında İşlemler</h3></div>
      <div className="card-body">
        {rows.length === 0
          ? <div className="loading">Henüz işlem bulunmuyor</div>
          : rows.map((t, i) => <TransactionItem key={i} t={t} />)
        }
      </div>
    </div>
  );
}
