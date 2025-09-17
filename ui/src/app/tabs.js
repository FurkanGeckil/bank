import Dashboard from '../features/dashboard/Dashboard.jsx'
import Bank from '../features/bank/Bank.jsx'
import Transactions from '../features/transactions/Transactions.jsx'
import Settings from '../features/settings/Settings.jsx'
import WebhookLogs from '../features/webhooks/WebhookLogs.jsx'
import TransferForm from '../features/transfer/TransferForm.jsx'
import FastTransactions from '../features/fast/FastTransactions.jsx'

export const TABS = [
  { id:'dashboard', icon:'fa-tachometer-alt', label:'Dashboard', component: Dashboard },
  { id:'accounts', icon:'fa-credit-card', label:'Hesaplar', component: Bank },
  { id:'webhooks', icon:'fa-bell', label:'WebHook İşlemleri', component: WebhookLogs },
  { id:'transactions', icon:'fa-list', label:'İşlemler', component: Transactions },
  { id:'settings', icon:'fa-cog', label:'Banka Ayarları', component: Settings },
  { id:'transfer', icon:'fa-paper-plane', label:'FAST’e Aktarım', component: TransferForm },
  { id:'fastTransactions', icon:'fa-bolt', label:'FAST İşlemleri', component: FastTransactions },
]
