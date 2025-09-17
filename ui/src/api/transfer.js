// src/api/transfer.js

// Varsayılan FAST API kökü (vite proxy sayesinde UI -> 5174 -> 8085 yönlenir)
const DEFAULT_FAST_API = '/khik-fast';

// --- URL yardımcıları ---
function ensureHttpOrPath(raw) {
  let v = (raw || '').trim();
  if (!v) return DEFAULT_FAST_API;
  // '/khik-fast' gibi path'e izin veriyoruz; http(s) ise origin de olur.
  if (v.startsWith('/')) return v.replace(/\/+$/, '');
  if (!/^[a-z]+:\/\//i.test(v)) v = 'http://' + v;
  return v.replace(/\/+$/, '');
}
function joinUrl(base, path) {
  const b = ensureHttpOrPath(base);
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
}

// --- storage anahtarları ---
const LS_KEY = 'fast.api.base';

// --- getter/setter ---
export function getFastApiBase() {
  const saved = localStorage.getItem(LS_KEY);
  return ensureHttpOrPath(saved || DEFAULT_FAST_API);
}
export function setFastApiBase(v) {
  const norm = ensureHttpOrPath(v);
  localStorage.setItem(LS_KEY, norm);
  return norm;
}

// --- HTTP yardımcıları ---
async function http(url, opt = {}) {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opt.headers || {}) },
    ...opt,
  });
  const text = await resp.text();
  if (!resp.ok) {
    // Sunucunun döndürdüğü hata mesajını yüzeye çıkar.
    let msg = text || `HTTP ${resp.status}`;
    try {
      const j = JSON.parse(text);
      msg = j.message || j.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

// --- API fonksiyonları ---
async function listTransactions(params = {}) {
  const base = getFastApiBase();
  const url  = joinUrl(base, 'transactions');

  // Opsiyonel tarih aralığı (YYYY-MM-DD) varsa querystring’e ekle
  const u = new URL(url, window.location.origin);
  if (params.start) u.searchParams.set('start', params.start);
  if (params.end)   u.searchParams.set('end', params.end);

  return http(u.toString(), { method: 'GET' });
}

async function transfer(payload) {
  // Eski isim -> yeni isim normalize: bankId geldiyse xBankId yap
  const p = { ...payload };
  if (p.bankId && !p.xBankId) {
    p.xBankId = p.bankId;
    delete p.bankId;
  }

  // Basit doğrulama
  const amount = Number(p.amount);
  if (!p.xBankId)               throw new Error('xBankId gerekli.');
  if (!p.khikTlAccountId)       throw new Error('khikTlAccountId gerekli.');
  if (!p.khikDtlAccountId)      throw new Error('khikDtlAccountId gerekli.');
  if (!isFinite(amount) || amount <= 0) throw new Error('amount > 0 olmalı.');

  const base = getFastApiBase();
  const url  = joinUrl(base, 'transfer');
  return http(url, { method: 'POST', body: JSON.stringify(p) });
}

// İsteğe bağlı: KHIK bazlı filtre (backend destekliyorsa)
async function listByKhik(khikTlAccountId, params = {}) {
  const base = getFastApiBase();
  const url  = joinUrl(base, 'transactions');
  const u = new URL(url, window.location.origin);
  if (khikTlAccountId) u.searchParams.set('khikTlAccountId', khikTlAccountId);
  if (params.start)     u.searchParams.set('start', params.start);
  if (params.end)       u.searchParams.set('end', params.end);
  return http(u.toString(), { method: 'GET' });
}

// Tek bir namespace altında toplu export
export const FAST = {
  listTransactions,
  listByKhik,
  transfer,
  getBase: getFastApiBase,
  setBase: setFastApiBase,
  DEFAULT_FAST_API,
};

// src/api/transfer.js
// ... (mevcut kodlar ve named export'lar)
export default FAST;   // <-- ekleyin
