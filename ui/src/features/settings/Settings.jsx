// src/features/settings/Settings.jsx
import { useEffect, useState } from 'react';
import { API } from '../../api/client';
import FAST from '../../api/transfer';
import './settings.css';

export default function Settings({ setLoading, setMsg }) {
  const [bankIban, setBankIban] = useState('');
  const [bankName, setBankName] = useState('');
  const [fastBase, setFastBase] = useState('');
  const currentFastBase = FAST.getBase();

  useEffect(() => {
    (async () => {
      try {
        setLoading?.(true);
        const s = await API.settingsGet().catch(() => ({}));
        setBankIban(s.bankIban || '');
        setBankName(s.bankName || '');
      } finally {
        setLoading?.(false);
      }
      setFastBase(FAST.getFastApiBase()); // or FAST.getBase()
    })();
  }, []);

  async function saveBank() {
    try {
      setLoading?.(true);
      await API.settingsSave({ bankIban, bankName });
      setMsg?.({ type: 'success', text: 'Banka ayarları güncellendi' });
    } catch (e) {
      setMsg?.({ type: 'error', text: e.message });
    } finally { setLoading?.(false); }
  }

  function saveFast() {
    try {
      setFastApiBase(fastBase);
      setMsg?.({ type: 'success', text: `FAST endpoint: ${FAST.getFastApiBase()}` });
    } catch (e) {
      setMsg?.({ type: 'error', text: e.message });
    }
  }

  function resetFast() {
    const v = FAST.resetFastApiBase();
    setFastBase(v);
    setMsg?.({ type: 'info', text: `Varsayılana döndürüldü: ${v}` });
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="card-head"><h3><i className="fas fa-university" /> Banka Bilgileri</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Banka IBAN</label>
            <input className="form-control" value={bankIban} onChange={e => setBankIban(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Banka Adı</label>
            <input className="form-control" value={bankName} onChange={e => setBankName(e.target.value)} />
          </div>
          <button className="btn primary" onClick={saveBank}><i className="fas fa-save" /> Kaydet</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3><i className="fas fa-bolt" /> FAST API Endpoint</h3></div>
        <div className="card-body">
          <div className="form-group">
            <label>Endpoint</label>
            <input className="form-control" value={fastBase} onChange={e => setFastBase(e.target.value)} placeholder="/khik-fast veya http://host:port/khik-fast" />
          </div>
          <div className="helper">
            <button className="btn secondary" onClick={resetFast}><i className="fas fa-rotate" /> Sıfırla</button>
            <button className="btn primary" onClick={saveFast}><i className="fas fa-check" /> Ayarla</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>Aktif: <code>{FAST.getFastApiBase()}</code></div>
        </div>
      </div>
    </div>
  );
}
