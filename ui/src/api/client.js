// src/api/client.js
const BASE = '/khik-bank';

async function http(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

const get = (p) => http('GET', p);
const post = (p, b) => http('POST', p, b);
const del = (p) => http('DELETE', p);

export const API = {
  // accounts
  accounts:        () => get('/list'),
  accountDelete:   (id) => del(`/account/${encodeURIComponent(id)}`),
  accountTx:       (accountId) => get(`/account/transactions?accountId=${encodeURIComponent(accountId)}`),

  // stats/settings
  stats:           () => get('/stats'),
  settingsGet:     () => get('/settings'),
  settingsSave:    (data) => post('/settings', data),

  // transactions grouped by TC
  transactionsByTc:() => get('/transactions/by-tc'),

  // webhooks
  webhookLogs:     () => get('/webhook-logs'),

  // back-compat (some lazy imports in your code used API.settings())
  settings:        () => get('/settings'),
};

export default API;
