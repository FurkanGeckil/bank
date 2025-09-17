// API Base URL - Dynamic based on current host
const API_BASE_URL = `${window.location.protocol}//${window.location.host}/khik-bank`;

// Global variables
let currentTab = 'dashboard';
let selectedAccountId = null; // Track selected account for transactions view

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    loadAccounts();
});

// Tab Navigation
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    currentTab = tabName;

    // Load data based on tab
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'transactions':
            selectedAccountId = null; // Clear selected account when switching to transactions tab
            loadTransactionsByTc();
            break;
        case 'webhooks':
            loadWebhookConsumers();
            loadWebhookLogs();
            break;
        case 'settings':
            loadBankSettings();
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        showLoading();

        // Load accounts for stats
        const accountsResponse = await fetch(`${API_BASE_URL}/list`);
        const accounts = await accountsResponse.json();

        // Calculate stats
        const totalAccounts = accounts.length;
        const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

        // Get total transactions from stats endpoint
        let totalTransactions = 0;
        try {
            const statsResponse = await fetch(`${API_BASE_URL}/stats`);
            const stats = await statsResponse.json();
            totalTransactions = stats.totalTransactions;
        } catch (error) {
            console.error('Error loading stats:', error);
        }

        // Update dashboard stats
        document.getElementById('totalAccounts').textContent = totalAccounts;
        document.getElementById('totalBalance').textContent = `${totalBalance.toFixed(2)} TRY`;
        document.getElementById('totalTransactions').textContent = totalTransactions;

        // Load recent transactions
        await loadRecentTransactions();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showMessage('Dashboard yüklenirken hata oluştu', 'error');
    } finally {
        hideLoading();
    }
}

async function loadRecentTransactions() {
    try {
        const accountsResponse = await fetch(`${API_BASE_URL}/list`);
        const accounts = await accountsResponse.json();

        const recentTransactions = [];

        // Get transactions for each account (limit to 5 per account)
        for (const account of accounts.slice(0, 3)) { // Limit to 3 accounts for performance
            try {
                const transactionsResponse = await fetch(`${API_BASE_URL}/account/transactions?accountId=${account.accountId}`);
                const transactions = await transactionsResponse.json();

                // Add account info to transactions
                const accountTransactions = transactions.slice(0, 3).map(transaction => ({
                    ...transaction,
                    accountName: account.accountName,
                    accountId: account.accountId
                }));

                recentTransactions.push(...accountTransactions);
            } catch (error) {
                console.error(`Error loading transactions for account ${account.accountId}:`, error);
            }
        }

        // Sort by date (newest first) and take top 10
        recentTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        const topTransactions = recentTransactions.slice(0, 10);

        displayRecentTransactions(topTransactions);

    } catch (error) {
        console.error('Error loading recent transactions:', error);
        document.getElementById('recentTransactions').innerHTML = '<div class="message error">Son işlemler yüklenirken hata oluştu</div>';
    }
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');

    if (transactions.length === 0) {
        container.innerHTML = '<div class="message info">Henüz işlem bulunmuyor</div>';
        return;
    }

    const html = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-tc">TC ID: ${transaction.tcId || 'N/A'}</div>
                <div class="transaction-time">${formatDate(transaction.transactionDate)}</div>
                <div class="transaction-account">${transaction.accountName || 'KHIK-TL Hesap'} (IBAN: ${transaction.accountId || 'N/A'})</div>
            </div>
            <div class="transaction-amount">${parseFloat(transaction.amount).toFixed(2)} TRY</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ==================== WEBHOOK CONSUMER MANAGEMENT ====================

// Load webhook consumers
async function loadWebhookConsumers() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers`);
        const consumers = await response.json();

        // Store consumers in sessionStorage for update modal
        sessionStorage.setItem('webhookConsumers', JSON.stringify(consumers));

        displayWebhookConsumers(consumers);
        updateConsumerCount(consumers.length);

    } catch (error) {
        console.error('Error loading webhook consumers:', error);
        document.getElementById('webhookConsumersList').innerHTML =
            '<div class="error">Consumer\'lar yüklenirken hata oluştu</div>';
    }
}

// Display webhook consumers
function displayWebhookConsumers(consumers) {
    const container = document.getElementById('webhookConsumersList');

    if (consumers.length === 0) {
        container.innerHTML = '<div class="empty-state">Henüz kayıtlı consumer bulunmuyor</div>';
        return;
    }

    const html = consumers.map(consumer => `
        <div class="consumer-item active">
            <div class="consumer-info">
                <div class="consumer-name">
                    <i class="fas fa-user"></i>
                    ${consumer.consumerName}
                    <span class="status-badge active">
                        Aktif
                    </span>
                </div>
                <div class="consumer-url">
                    <i class="fas fa-link"></i>
                    ${consumer.callbackUrl}
                </div>
                ${consumer.description ? `<div class="consumer-description">${consumer.description}</div>` : ''}
                <div class="consumer-stats">
                    <span class="stat-item">
                        <i class="fas fa-paper-plane"></i>
                        ${consumer.webhookCount || 0} webhook
                    </span>
                    <span class="stat-item success">
                        <i class="fas fa-check"></i>
                        ${consumer.successfulWebhookCount || 0} başarılı
                    </span>
                    <span class="stat-item failed">
                        <i class="fas fa-times"></i>
                        ${consumer.failedWebhookCount || 0} başarısız
                    </span>
                </div>
                <div class="consumer-meta">
                    <small>Kayıt: ${formatDate(consumer.createdAt)}</small>
                    ${consumer.lastWebhookSent ? `<small>Son webhook: ${formatDate(consumer.lastWebhookSent)}</small>` : ''}
                </div>
            </div>
            <div class="consumer-actions">
                <button class="btn btn-sm btn-primary" onclick="sendTestWebhook(${consumer.id})">
                    <i class="fas fa-paper-plane"></i> Test
                </button>
                <button class="btn btn-sm btn-info" onclick="showUpdateConsumerModal(${consumer.id})">
                    <i class="fas fa-edit"></i> Güncelle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteConsumer(${consumer.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Update consumer count
function updateConsumerCount(count) {
    document.getElementById('consumerCount').textContent = count;
}

// Show register consumer modal
function showRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'block';
}

// Close register consumer modal
function closeRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('consumerName').value = '';
    document.getElementById('callbackUrl').value = '';
    document.getElementById('consumerDescription').value = '';
}

// Register webhook consumer
async function registerWebhookConsumer() {
    const consumerName = document.getElementById('consumerName').value.trim();
    const callbackUrl = document.getElementById('callbackUrl').value.trim();
    const description = document.getElementById('consumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeRegisterConsumerModal();
            loadWebhookConsumers();
            showNotification('Consumer başarıyla kaydedildi!', 'success');
        } else {
            showNotification(result.message || 'Consumer kaydedilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error registering consumer:', error);
        showNotification('Consumer kaydedilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Delete consumer
async function deleteConsumer(consumerId) {
    if (!confirm('Consumer\'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer silindi!', 'success');
        } else {
            showNotification(result.message || 'Consumer silinemedi!', 'error');
        }

    } catch (error) {
        console.error('Error deleting consumer:', error);
        showNotification('Consumer silinirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Send test webhook
async function sendTestWebhook(consumerId) {
    const testData = `Test Webhook Verisi:
• TC ID: TEST_TC_ID
• Miktar: 1.00 TRY
• İşlem ID: TEST_TRANSACTION_ID
• Kaynak: BANK_TRANSFER
• Açıklama: Test webhook from KHIK Bank Module

Bu test verisini göndermek istediğinizden emin misiniz?`;

    if (!confirm(testData)) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}/test`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderildi!', 'success');
            loadWebhookConsumers(); // Refresh to update stats
        } else {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error sending test webhook:', error);
        showNotification('Test webhook gönderilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Show update consumer modal
function showUpdateConsumerModal(consumerId) {
    // Find consumer data
    const consumers = JSON.parse(sessionStorage.getItem('webhookConsumers') || '[]');
    const consumer = consumers.find(c => c.id === consumerId);

    if (consumer) {
        // Fill form with current data
        document.getElementById('updateConsumerId').value = consumer.id;
        document.getElementById('updateConsumerName').value = consumer.consumerName;
        document.getElementById('updateCallbackUrl').value = consumer.callbackUrl;
        document.getElementById('updateConsumerDescription').value = consumer.description || '';

        // Show modal
        document.getElementById('updateConsumerModal').style.display = 'block';
    } else {
        showNotification('Consumer bilgileri bulunamadı!', 'error');
    }
}

// Close update consumer modal
function closeUpdateConsumerModal() {
    document.getElementById('updateConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('updateConsumerId').value = '';
    document.getElementById('updateConsumerName').value = '';
    document.getElementById('updateCallbackUrl').value = '';
    document.getElementById('updateConsumerDescription').value = '';
}

// Update webhook consumer
async function updateWebhookConsumer() {
    const consumerId = document.getElementById('updateConsumerId').value;
    const consumerName = document.getElementById('updateConsumerName').value.trim();
    const callbackUrl = document.getElementById('updateCallbackUrl').value.trim();
    const description = document.getElementById('updateConsumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeUpdateConsumerModal();
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer başarıyla güncellendi!', 'success');
        } else {
            showNotification(result.message || 'Consumer güncellenemedi!', 'error');
        }

    } catch (error) {
        console.error('Error updating consumer:', error);
        showNotification('Consumer güncellenirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Account Functions
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/list`);
        const accounts = await response.json();

        displayAccounts(accounts);

    } catch (error) {
        console.error('Error loading accounts:', error);
        showMessage('Hesaplar yüklenirken hata oluştu', 'error');
    }
}

function displayAccounts(accounts) {
    const container = document.getElementById('accountsGrid');

    if (accounts.length === 0) {
        container.innerHTML = '<div class="message info">Henüz hesap bulunmuyor</div>';
        return;
    }

    const html = accounts.map(account => `
        <div class="account-card">
            <div class="account-header">
                <div class="account-name">${account.accountName}</div>
                <div class="account-id">IBAN: ${account.accountId}</div>
            </div>
            <div class="account-balance">${parseFloat(account.balance).toFixed(2)} TRY</div>
            <div class="account-actions">
                <button class="btn btn-secondary" onclick="viewAccountTransactions('${account.accountId}')">
                    <i class="fas fa-list"></i> İşlemler
                </button>
                <button class="btn btn-secondary" onclick="deleteAccount('${account.accountId}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ==================== WEBHOOK CONSUMER MANAGEMENT ====================

// Load webhook consumers
async function loadWebhookConsumers() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers`);
        const consumers = await response.json();

        // Store consumers in sessionStorage for update modal
        sessionStorage.setItem('webhookConsumers', JSON.stringify(consumers));

        displayWebhookConsumers(consumers);
        updateConsumerCount(consumers.length);

    } catch (error) {
        console.error('Error loading webhook consumers:', error);
        document.getElementById('webhookConsumersList').innerHTML =
            '<div class="error">Consumer\'lar yüklenirken hata oluştu</div>';
    }
}

// Display webhook consumers
function displayWebhookConsumers(consumers) {
    const container = document.getElementById('webhookConsumersList');

    if (consumers.length === 0) {
        container.innerHTML = '<div class="empty-state">Henüz kayıtlı consumer bulunmuyor</div>';
        return;
    }

    const html = consumers.map(consumer => `
        <div class="consumer-item active">
            <div class="consumer-info">
                <div class="consumer-name">
                    <i class="fas fa-user"></i>
                    ${consumer.consumerName}
                    <span class="status-badge active">
                        Aktif
                    </span>
                </div>
                <div class="consumer-url">
                    <i class="fas fa-link"></i>
                    ${consumer.callbackUrl}
                </div>
                ${consumer.description ? `<div class="consumer-description">${consumer.description}</div>` : ''}
                <div class="consumer-stats">
                    <span class="stat-item">
                        <i class="fas fa-paper-plane"></i>
                        ${consumer.webhookCount || 0} webhook
                    </span>
                    <span class="stat-item success">
                        <i class="fas fa-check"></i>
                        ${consumer.successfulWebhookCount || 0} başarılı
                    </span>
                    <span class="stat-item failed">
                        <i class="fas fa-times"></i>
                        ${consumer.failedWebhookCount || 0} başarısız
                    </span>
                </div>
                <div class="consumer-meta">
                    <small>Kayıt: ${formatDate(consumer.createdAt)}</small>
                    ${consumer.lastWebhookSent ? `<small>Son webhook: ${formatDate(consumer.lastWebhookSent)}</small>` : ''}
                </div>
            </div>
            <div class="consumer-actions">
                <button class="btn btn-sm btn-primary" onclick="sendTestWebhook(${consumer.id})">
                    <i class="fas fa-paper-plane"></i> Test
                </button>
                <button class="btn btn-sm btn-info" onclick="showUpdateConsumerModal(${consumer.id})">
                    <i class="fas fa-edit"></i> Güncelle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteConsumer(${consumer.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Update consumer count
function updateConsumerCount(count) {
    document.getElementById('consumerCount').textContent = count;
}

// Show register consumer modal
function showRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'block';
}

// Close register consumer modal
function closeRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('consumerName').value = '';
    document.getElementById('callbackUrl').value = '';
    document.getElementById('consumerDescription').value = '';
}

// Register webhook consumer
async function registerWebhookConsumer() {
    const consumerName = document.getElementById('consumerName').value.trim();
    const callbackUrl = document.getElementById('callbackUrl').value.trim();
    const description = document.getElementById('consumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeRegisterConsumerModal();
            loadWebhookConsumers();
            showNotification('Consumer başarıyla kaydedildi!', 'success');
        } else {
            showNotification(result.message || 'Consumer kaydedilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error registering consumer:', error);
        showNotification('Consumer kaydedilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Delete consumer
async function deleteConsumer(consumerId) {
    if (!confirm('Consumer\'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer silindi!', 'success');
        } else {
            showNotification(result.message || 'Consumer silinemedi!', 'error');
        }

    } catch (error) {
        console.error('Error deleting consumer:', error);
        showNotification('Consumer silinirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Send test webhook
async function sendTestWebhook(consumerId) {
    const testData = `Test Webhook Verisi:
• TC ID: TEST_TC_ID
• Miktar: 1.00 TRY
• İşlem ID: TEST_TRANSACTION_ID
• Kaynak: BANK_TRANSFER
• Açıklama: Test webhook from KHIK Bank Module

Bu test verisini göndermek istediğinizden emin misiniz?`;

    if (!confirm(testData)) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}/test`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderildi!', 'success');
            loadWebhookConsumers(); // Refresh to update stats
        } else {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error sending test webhook:', error);
        showNotification('Test webhook gönderilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Show update consumer modal
function showUpdateConsumerModal(consumerId) {
    // Find consumer data
    const consumers = JSON.parse(sessionStorage.getItem('webhookConsumers') || '[]');
    const consumer = consumers.find(c => c.id === consumerId);

    if (consumer) {
        // Fill form with current data
        document.getElementById('updateConsumerId').value = consumer.id;
        document.getElementById('updateConsumerName').value = consumer.consumerName;
        document.getElementById('updateCallbackUrl').value = consumer.callbackUrl;
        document.getElementById('updateConsumerDescription').value = consumer.description || '';

        // Show modal
        document.getElementById('updateConsumerModal').style.display = 'block';
    } else {
        showNotification('Consumer bilgileri bulunamadı!', 'error');
    }
}

// Close update consumer modal
function closeUpdateConsumerModal() {
    document.getElementById('updateConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('updateConsumerId').value = '';
    document.getElementById('updateConsumerName').value = '';
    document.getElementById('updateCallbackUrl').value = '';
    document.getElementById('updateConsumerDescription').value = '';
}

// Update webhook consumer
async function updateWebhookConsumer() {
    const consumerId = document.getElementById('updateConsumerId').value;
    const consumerName = document.getElementById('updateConsumerName').value.trim();
    const callbackUrl = document.getElementById('updateCallbackUrl').value.trim();
    const description = document.getElementById('updateConsumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeUpdateConsumerModal();
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer başarıyla güncellendi!', 'success');
        } else {
            showNotification(result.message || 'Consumer güncellenemedi!', 'error');
        }

    } catch (error) {
        console.error('Error updating consumer:', error);
        showNotification('Consumer güncellenirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Transaction Functions
async function loadTransactions() {
    try {
        const accountsResponse = await fetch(`${API_BASE_URL}/list`);
        const accounts = await accountsResponse.json();

        const allTransactions = [];

        // Get transactions for all accounts
        for (const account of accounts) {
            try {
                const transactionsResponse = await fetch(`${API_BASE_URL}/account/transactions?accountId=${account.accountId}`);
                const transactions = await transactionsResponse.json();

                // Add account info to transactions
                const accountTransactions = transactions.map(transaction => ({
                    ...transaction,
                    accountName: account.accountName,
                    accountId: account.accountId
                }));

                allTransactions.push(...accountTransactions);
            } catch (error) {
                console.error(`Error loading transactions for account ${account.accountId}:`, error);
            }
        }

        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

        displayTransactions(allTransactions);

    } catch (error) {
        console.error('Error loading transactions:', error);
        showMessage('İşlemler yüklenirken hata oluştu', 'error');
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');

    if (transactions.length === 0) {
        container.innerHTML = '<div class="message info">Henüz işlem bulunmuyor</div>';
        return;
    }

    const html = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-header">
                <div class="transaction-amount">${parseFloat(transaction.amount).toFixed(2)} TRY</div>
                <div class="transaction-date">${formatDate(transaction.transactionDate)}</div>
            </div>
            <div class="transaction-description">
                <strong>${transaction.accountName}</strong> (${transaction.accountId})<br>
                ${transaction.description || 'Açıklama yok'}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ==================== WEBHOOK CONSUMER MANAGEMENT ====================

// Load webhook consumers
async function loadWebhookConsumers() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers`);
        const consumers = await response.json();

        // Store consumers in sessionStorage for update modal
        sessionStorage.setItem('webhookConsumers', JSON.stringify(consumers));

        displayWebhookConsumers(consumers);
        updateConsumerCount(consumers.length);

    } catch (error) {
        console.error('Error loading webhook consumers:', error);
        document.getElementById('webhookConsumersList').innerHTML =
            '<div class="error">Consumer\'lar yüklenirken hata oluştu</div>';
    }
}

// Display webhook consumers
function displayWebhookConsumers(consumers) {
    const container = document.getElementById('webhookConsumersList');

    if (consumers.length === 0) {
        container.innerHTML = '<div class="empty-state">Henüz kayıtlı consumer bulunmuyor</div>';
        return;
    }

    const html = consumers.map(consumer => `
        <div class="consumer-item active">
            <div class="consumer-info">
                <div class="consumer-name">
                    <i class="fas fa-user"></i>
                    ${consumer.consumerName}
                    <span class="status-badge active">
                        Aktif
                    </span>
                </div>
                <div class="consumer-url">
                    <i class="fas fa-link"></i>
                    ${consumer.callbackUrl}
                </div>
                ${consumer.description ? `<div class="consumer-description">${consumer.description}</div>` : ''}
                <div class="consumer-stats">
                    <span class="stat-item">
                        <i class="fas fa-paper-plane"></i>
                        ${consumer.webhookCount || 0} webhook
                    </span>
                    <span class="stat-item success">
                        <i class="fas fa-check"></i>
                        ${consumer.successfulWebhookCount || 0} başarılı
                    </span>
                    <span class="stat-item failed">
                        <i class="fas fa-times"></i>
                        ${consumer.failedWebhookCount || 0} başarısız
                    </span>
                </div>
                <div class="consumer-meta">
                    <small>Kayıt: ${formatDate(consumer.createdAt)}</small>
                    ${consumer.lastWebhookSent ? `<small>Son webhook: ${formatDate(consumer.lastWebhookSent)}</small>` : ''}
                </div>
            </div>
            <div class="consumer-actions">
                <button class="btn btn-sm btn-primary" onclick="sendTestWebhook(${consumer.id})">
                    <i class="fas fa-paper-plane"></i> Test
                </button>
                <button class="btn btn-sm btn-info" onclick="showUpdateConsumerModal(${consumer.id})">
                    <i class="fas fa-edit"></i> Güncelle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteConsumer(${consumer.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Update consumer count
function updateConsumerCount(count) {
    document.getElementById('consumerCount').textContent = count;
}

// Show register consumer modal
function showRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'block';
}

// Close register consumer modal
function closeRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('consumerName').value = '';
    document.getElementById('callbackUrl').value = '';
    document.getElementById('consumerDescription').value = '';
}

// Register webhook consumer
async function registerWebhookConsumer() {
    const consumerName = document.getElementById('consumerName').value.trim();
    const callbackUrl = document.getElementById('callbackUrl').value.trim();
    const description = document.getElementById('consumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeRegisterConsumerModal();
            loadWebhookConsumers();
            showNotification('Consumer başarıyla kaydedildi!', 'success');
        } else {
            showNotification(result.message || 'Consumer kaydedilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error registering consumer:', error);
        showNotification('Consumer kaydedilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Delete consumer
async function deleteConsumer(consumerId) {
    if (!confirm('Consumer\'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer silindi!', 'success');
        } else {
            showNotification(result.message || 'Consumer silinemedi!', 'error');
        }

    } catch (error) {
        console.error('Error deleting consumer:', error);
        showNotification('Consumer silinirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Send test webhook
async function sendTestWebhook(consumerId) {
    const testData = `Test Webhook Verisi:
• TC ID: TEST_TC_ID
• Miktar: 1.00 TRY
• İşlem ID: TEST_TRANSACTION_ID
• Kaynak: BANK_TRANSFER
• Açıklama: Test webhook from KHIK Bank Module

Bu test verisini göndermek istediğinizden emin misiniz?`;

    if (!confirm(testData)) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}/test`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderildi!', 'success');
            loadWebhookConsumers(); // Refresh to update stats
        } else {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error sending test webhook:', error);
        showNotification('Test webhook gönderilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Show update consumer modal
function showUpdateConsumerModal(consumerId) {
    // Find consumer data
    const consumers = JSON.parse(sessionStorage.getItem('webhookConsumers') || '[]');
    const consumer = consumers.find(c => c.id === consumerId);

    if (consumer) {
        // Fill form with current data
        document.getElementById('updateConsumerId').value = consumer.id;
        document.getElementById('updateConsumerName').value = consumer.consumerName;
        document.getElementById('updateCallbackUrl').value = consumer.callbackUrl;
        document.getElementById('updateConsumerDescription').value = consumer.description || '';

        // Show modal
        document.getElementById('updateConsumerModal').style.display = 'block';
    } else {
        showNotification('Consumer bilgileri bulunamadı!', 'error');
    }
}

// Close update consumer modal
function closeUpdateConsumerModal() {
    document.getElementById('updateConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('updateConsumerId').value = '';
    document.getElementById('updateConsumerName').value = '';
    document.getElementById('updateCallbackUrl').value = '';
    document.getElementById('updateConsumerDescription').value = '';
}

// Update webhook consumer
async function updateWebhookConsumer() {
    const consumerId = document.getElementById('updateConsumerId').value;
    const consumerName = document.getElementById('updateConsumerName').value.trim();
    const callbackUrl = document.getElementById('updateCallbackUrl').value.trim();
    const description = document.getElementById('updateConsumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeUpdateConsumerModal();
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer başarıyla güncellendi!', 'success');
        } else {
            showNotification(result.message || 'Consumer güncellenemedi!', 'error');
        }

    } catch (error) {
        console.error('Error updating consumer:', error);
        showNotification('Consumer güncellenirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

function searchTransactions() {
    const searchTerm = document.getElementById('accountSearch').value.trim();

    if (!searchTerm) {
        loadTransactions();
        return;
    }

    // Filter transactions by account ID
    const transactionItems = document.querySelectorAll('.transaction-item');
    transactionItems.forEach(item => {
        const accountId = item.querySelector('.transaction-description').textContent;
        if (accountId.toLowerCase().includes(searchTerm.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Account Management Functions
function showCreateAccountModal() {
    // Clear any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    document.getElementById('createAccountModal').style.display = 'block';
}

function closeCreateAccountModal() {
    document.getElementById('createAccountModal').style.display = 'none';
    // Clear form
    document.getElementById('newAccountId').value = '';
    document.getElementById('newAccountName').value = '';
    // Clear any messages in modal
    const modalMessages = document.querySelectorAll('#createAccountModal .message');
    modalMessages.forEach(msg => msg.remove());
}

async function createAccount() {
    try {
        const accountId = document.getElementById('newAccountId').value.trim();
        const accountName = document.getElementById('newAccountName').value.trim();

        if (!accountId || !accountName) {
            showMessage('Tüm alanları doldurunuz', 'error');
            return;
        }

        showLoading();

        const response = await fetch(`${API_BASE_URL}/account/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: accountId,
                accountName: accountName
            })
        });

        if (response.ok) {
            const account = await response.json();
            showMessage('Hesap başarıyla oluşturuldu', 'success');
            closeCreateAccountModal();
            loadAccounts();
            loadDashboard(); // Refresh dashboard stats
        } else {
            let errorMessage = 'Hesap oluşturulurken hata oluştu';

            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.errors && errorData.errors.length > 0) {
                    errorMessage = errorData.errors.map(err => err.defaultMessage || err.message).join(', ');
                } else if (typeof errorData === 'object') {
                    // Handle validation errors from exception handler
                    const validationErrors = Object.values(errorData);
                    if (validationErrors.length > 0) {
                        errorMessage = validationErrors.join(', ');
                    }
                }
            } catch (e) {
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            showMessage(`Hata: ${errorMessage}`, 'error');
        }

    } catch (error) {
        console.error('Error creating account:', error);
        showMessage('Hesap oluşturulurken hata oluştu', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteAccount(accountId) {
    // Banka hesabının silinmesini engelle
    if (accountId.includes('XXX Bank') || accountId.includes('KHIK Bank')) {
        showMessage('Banka hesabı silinemez!', 'error');
        return;
    }

    if (!confirm(`"${accountId}" hesabını silmek istediğinizden emin misiniz?`)) {
        return;
    }

    try {
        showLoading();

        console.log('Deleting account:', accountId);
        console.log('DELETE URL:', `${API_BASE_URL}/account/${accountId}`);

        const response = await fetch(`${API_BASE_URL}/account/${accountId}`, {
            method: 'DELETE'
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const responseText = await response.text();
            console.log('Response text:', responseText);
            showMessage('Hesap başarıyla silindi', 'success');
            loadAccounts();
            loadDashboard(); // Refresh dashboard stats
        } else {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            showMessage(`Hata: ${errorText}`, 'error');
        }

    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage('Hesap silinirken hata oluştu', 'error');
    } finally {
        hideLoading();
    }
}

function viewAccountTransactions(accountId) {
    // Set selected account ID
    selectedAccountId = accountId;

    // Switch to transactions tab without clearing selectedAccountId
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab content
    document.getElementById('transactions').classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    currentTab = 'transactions';

    // Load transactions for selected account
    loadTransactionsByTc();
    document.getElementById('accountSearch').value = accountId;
}

// Utility Functions
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Check if a modal is open
    const openModal = document.querySelector('.modal[style*="block"]');
    if (openModal) {
        // If modal is open, show message in modal
        const modalContent = openModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.insertBefore(messageDiv, modalContent.firstChild);
        }
    } else {
        // If no modal is open, show message in container
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createAccountModal');
    if (event.target === modal) {
        closeCreateAccountModal();
    }
}

// Webhook Logs Functions
async function loadWebhookLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook-logs`);
        const webhookLogs = await response.json();

        displayWebhookLogs(webhookLogs);

    } catch (error) {
        console.error('Error loading webhook logs:', error);
        showMessage('Webhook logları yüklenirken hata oluştu', 'error');
    }
}

function displayWebhookLogs(webhookLogs) {
    const container = document.getElementById('webhookLogsList');

    if (webhookLogs.length === 0) {
        container.innerHTML = '<div class="message info">Henüz webhook işlemi bulunmuyor</div>';
        document.getElementById('successCount').textContent = '0';
        document.getElementById('failedCount').textContent = '0';
        return;
    }

    // Calculate statistics
    const successCount = webhookLogs.filter(log => log.status === 'SUCCESS').length;
    const failedCount = webhookLogs.filter(log => log.status === 'FAILED').length;

    // Update statistics badges
    document.getElementById('successCount').textContent = successCount;
    document.getElementById('failedCount').textContent = failedCount;

    const html = webhookLogs.map(log => `
        <div class="webhook-log-item ${log.status.toLowerCase()}">
            <div class="webhook-log-header">
                <div class="webhook-status ${log.status.toLowerCase()}">
                    <i class="fas fa-${log.status === 'SUCCESS' ? 'check-circle' : 'exclamation-circle'}"></i>
                    ${log.status}
                </div>
                <div class="webhook-date">${formatDate(log.createdAt)}</div>
            </div>
            <div class="webhook-details">
                <div><strong>TC ID:</strong> ${log.tcId}</div>
                <div><strong>İşlem ID:</strong> ${log.transactionId}</div>
                <div><strong>Tutar:</strong> ${log.amount} TRY</div>
                <div><strong>Açıklama:</strong> ${log.description || 'Açıklama yok'}</div>
                <div><strong>Webhook URL:</strong> ${log.webhookUrl}</div>
                ${log.errorMessage ? `<div><strong>Hata:</strong> ${log.errorMessage}</div>` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ==================== WEBHOOK CONSUMER MANAGEMENT ====================

// Load webhook consumers
async function loadWebhookConsumers() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers`);
        const consumers = await response.json();

        // Store consumers in sessionStorage for update modal
        sessionStorage.setItem('webhookConsumers', JSON.stringify(consumers));

        displayWebhookConsumers(consumers);
        updateConsumerCount(consumers.length);

    } catch (error) {
        console.error('Error loading webhook consumers:', error);
        document.getElementById('webhookConsumersList').innerHTML =
            '<div class="error">Consumer\'lar yüklenirken hata oluştu</div>';
    }
}

// Display webhook consumers
function displayWebhookConsumers(consumers) {
    const container = document.getElementById('webhookConsumersList');

    if (consumers.length === 0) {
        container.innerHTML = '<div class="empty-state">Henüz kayıtlı consumer bulunmuyor</div>';
        return;
    }

    const html = consumers.map(consumer => `
        <div class="consumer-item active">
            <div class="consumer-info">
                <div class="consumer-name">
                    <i class="fas fa-user"></i>
                    ${consumer.consumerName}
                    <span class="status-badge active">
                        Aktif
                    </span>
                </div>
                <div class="consumer-url">
                    <i class="fas fa-link"></i>
                    ${consumer.callbackUrl}
                </div>
                ${consumer.description ? `<div class="consumer-description">${consumer.description}</div>` : ''}
                <div class="consumer-stats">
                    <span class="stat-item">
                        <i class="fas fa-paper-plane"></i>
                        ${consumer.webhookCount || 0} webhook
                    </span>
                    <span class="stat-item success">
                        <i class="fas fa-check"></i>
                        ${consumer.successfulWebhookCount || 0} başarılı
                    </span>
                    <span class="stat-item failed">
                        <i class="fas fa-times"></i>
                        ${consumer.failedWebhookCount || 0} başarısız
                    </span>
                </div>
                <div class="consumer-meta">
                    <small>Kayıt: ${formatDate(consumer.createdAt)}</small>
                    ${consumer.lastWebhookSent ? `<small>Son webhook: ${formatDate(consumer.lastWebhookSent)}</small>` : ''}
                </div>
            </div>
            <div class="consumer-actions">
                <button class="btn btn-sm btn-primary" onclick="sendTestWebhook(${consumer.id})">
                    <i class="fas fa-paper-plane"></i> Test
                </button>
                <button class="btn btn-sm btn-info" onclick="showUpdateConsumerModal(${consumer.id})">
                    <i class="fas fa-edit"></i> Güncelle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteConsumer(${consumer.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Update consumer count
function updateConsumerCount(count) {
    document.getElementById('consumerCount').textContent = count;
}

// Show register consumer modal
function showRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'block';
}

// Close register consumer modal
function closeRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('consumerName').value = '';
    document.getElementById('callbackUrl').value = '';
    document.getElementById('consumerDescription').value = '';
}

// Register webhook consumer
async function registerWebhookConsumer() {
    const consumerName = document.getElementById('consumerName').value.trim();
    const callbackUrl = document.getElementById('callbackUrl').value.trim();
    const description = document.getElementById('consumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeRegisterConsumerModal();
            loadWebhookConsumers();
            showNotification('Consumer başarıyla kaydedildi!', 'success');
        } else {
            showNotification(result.message || 'Consumer kaydedilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error registering consumer:', error);
        showNotification('Consumer kaydedilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Delete consumer
async function deleteConsumer(consumerId) {
    if (!confirm('Consumer\'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer silindi!', 'success');
        } else {
            showNotification(result.message || 'Consumer silinemedi!', 'error');
        }

    } catch (error) {
        console.error('Error deleting consumer:', error);
        showNotification('Consumer silinirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Send test webhook
async function sendTestWebhook(consumerId) {
    const testData = `Test Webhook Verisi:
• TC ID: TEST_TC_ID
• Miktar: 1.00 TRY
• İşlem ID: TEST_TRANSACTION_ID
• Kaynak: BANK_TRANSFER
• Açıklama: Test webhook from KHIK Bank Module

Bu test verisini göndermek istediğinizden emin misiniz?`;

    if (!confirm(testData)) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}/test`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderildi!', 'success');
            loadWebhookConsumers(); // Refresh to update stats
        } else {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error sending test webhook:', error);
        showNotification('Test webhook gönderilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Show update consumer modal
function showUpdateConsumerModal(consumerId) {
    // Find consumer data
    const consumers = JSON.parse(sessionStorage.getItem('webhookConsumers') || '[]');
    const consumer = consumers.find(c => c.id === consumerId);

    if (consumer) {
        // Fill form with current data
        document.getElementById('updateConsumerId').value = consumer.id;
        document.getElementById('updateConsumerName').value = consumer.consumerName;
        document.getElementById('updateCallbackUrl').value = consumer.callbackUrl;
        document.getElementById('updateConsumerDescription').value = consumer.description || '';

        // Show modal
        document.getElementById('updateConsumerModal').style.display = 'block';
    } else {
        showNotification('Consumer bilgileri bulunamadı!', 'error');
    }
}

// Close update consumer modal
function closeUpdateConsumerModal() {
    document.getElementById('updateConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('updateConsumerId').value = '';
    document.getElementById('updateConsumerName').value = '';
    document.getElementById('updateCallbackUrl').value = '';
    document.getElementById('updateConsumerDescription').value = '';
}

// Update webhook consumer
async function updateWebhookConsumer() {
    const consumerId = document.getElementById('updateConsumerId').value;
    const consumerName = document.getElementById('updateConsumerName').value.trim();
    const callbackUrl = document.getElementById('updateCallbackUrl').value.trim();
    const description = document.getElementById('updateConsumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeUpdateConsumerModal();
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer başarıyla güncellendi!', 'success');
        } else {
            showNotification(result.message || 'Consumer güncellenemedi!', 'error');
        }

    } catch (error) {
        console.error('Error updating consumer:', error);
        showNotification('Consumer güncellenirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Bank Settings Functions


// Bank Settings Functions
async function loadBankSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const settings = await response.json();

        // Populate form fields
        document.getElementById('bankIban').value = settings.bankIban || '';
        document.getElementById('bankName').value = settings.bankName || '';
        document.getElementById('bankCurrency').value = settings.currency || 'TRY';

    } catch (error) {
        console.error('Error loading bank settings:', error);
        showMessage('Banka ayarları yüklenirken hata oluştu', 'error');
    }
}

async function updateBankSettings() {
    try {
        const bankIban = document.getElementById('bankIban').value.trim();
        const bankName = document.getElementById('bankName').value.trim();

        // Validation
        if (!bankIban) {
            showMessage('Banka IBAN alanı boş olamaz', 'error');
            return;
        }

        if (!bankName) {
            showMessage('Banka adı alanı boş olamaz', 'error');
            return;
        }

        // IBAN validation (TR + 24 digits)
        const ibanRegex = /^TR[0-9]{24}$/;
        if (!ibanRegex.test(bankIban)) {
            showMessage('Geçerli bir IBAN numarası giriniz (TR + 24 rakam)', 'error');
            return;
        }

        showLoading();

        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bankIban: bankIban,
                bankName: bankName
            })
        });

        if (response.ok) {
            const updatedSettings = await response.json();
            showMessage('Banka ayarları başarıyla güncellendi', 'success');

            // Update form fields with response data
            document.getElementById('bankIban').value = updatedSettings.bankIban;
            document.getElementById('bankName').value = updatedSettings.bankName;
            document.getElementById('bankCurrency').value = updatedSettings.currency;

        } else {
            const errorText = await response.text();
            showMessage(`Hata: ${errorText}`, 'error');
        }

    } catch (error) {
        console.error('Error updating bank settings:', error);
        showMessage('Banka ayarları güncellenirken hata oluştu', 'error');
    } finally {
        hideLoading();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCreateAccountModal();
    }
});

// TC ID Bazında İşlem Fonksiyonları
async function loadTransactionsByTc() {
    try {
        showLoading();

        // Eğer seçili bir hesap varsa, o hesaba ait işlemleri yükle
        if (selectedAccountId) {
            const response = await fetch(`${API_BASE_URL}/account/transactions?accountId=${selectedAccountId}`);
            const transactions = await response.json();

            // TC ID bazında grupla
            const tcTransactions = {};
            transactions.forEach(transaction => {
                const tcId = transaction.tcId;
                if (!tcTransactions[tcId]) {
                    tcTransactions[tcId] = [];
                }
                tcTransactions[tcId].push(transaction);
            });

            displayTcDetails(tcTransactions, {});
        } else {
            // Tüm işlemleri yükle
            const response = await fetch(`${API_BASE_URL}/transactions/by-tc`);
            const data = await response.json();

            displayTcDetails(data.tcTransactions, data.tcTotalAmounts);
        }

    } catch (error) {
        console.error('Error loading transactions by TC:', error);
        showMessage('TC ID bazında işlemler yüklenirken hata oluştu', 'error');
    } finally {
        hideLoading();
    }
}



function displayTcDetails(tcTransactions, tcTotalAmounts) {
    const container = document.getElementById('tcDetails');

    if (!tcTransactions || Object.keys(tcTransactions).length === 0) {
        container.innerHTML = '<div class="no-data">Henüz TC ID bazında işlem bulunmuyor</div>';
        return;
    }

    // Tüm işlemleri tek bir listede topla
    let allTransactions = [];
    Object.entries(tcTransactions).forEach(([tcId, transactions]) => {
        transactions.forEach(transaction => {
            allTransactions.push({
                ...transaction,
                tcId: tcId
            });
        });
    });

    // Tarihe göre sırala (en yeni önce)
    allTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

    // Toplam miktarı hesapla
    const totalAmount = allTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

    const html = `
        <div class="transactions-summary" style="background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Toplam İşlem Sayısı:</strong> ${allTransactions.length}
                </div>
                <div style="font-size: 1.2em; font-weight: bold; color: #007bff;">
                    <strong>Toplam Miktar:</strong> ${totalAmount.toFixed(2)} TRY
                </div>
            </div>
        </div>
        ${allTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-tc">TC ID: ${transaction.tcId || 'N/A'}</div>
                    <div class="transaction-time">${formatDate(transaction.transactionDate)}</div>
                    <div class="transaction-account">${transaction.accountName || 'KHIK-TL Hesap'} (IBAN: ${transaction.accountId || 'N/A'})</div>
                </div>
                <div class="transaction-amount">${parseFloat(transaction.amount).toFixed(2)} TRY</div>
            </div>
        `).join('')}
    `;

    container.innerHTML = html;
}

// ==================== WEBHOOK CONSUMER MANAGEMENT ====================

// Load webhook consumers
async function loadWebhookConsumers() {
    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers`);
        const consumers = await response.json();

        // Store consumers in sessionStorage for update modal
        sessionStorage.setItem('webhookConsumers', JSON.stringify(consumers));

        displayWebhookConsumers(consumers);
        updateConsumerCount(consumers.length);

    } catch (error) {
        console.error('Error loading webhook consumers:', error);
        document.getElementById('webhookConsumersList').innerHTML =
            '<div class="error">Consumer\'lar yüklenirken hata oluştu</div>';
    }
}

// Display webhook consumers
function displayWebhookConsumers(consumers) {
    const container = document.getElementById('webhookConsumersList');

    if (consumers.length === 0) {
        container.innerHTML = '<div class="empty-state">Henüz kayıtlı consumer bulunmuyor</div>';
        return;
    }

    const html = consumers.map(consumer => `
        <div class="consumer-item active">
            <div class="consumer-info">
                <div class="consumer-name">
                    <i class="fas fa-user"></i>
                    ${consumer.consumerName}
                    <span class="status-badge active">
                        Aktif
                    </span>
                </div>
                <div class="consumer-url">
                    <i class="fas fa-link"></i>
                    ${consumer.callbackUrl}
                </div>
                ${consumer.description ? `<div class="consumer-description">${consumer.description}</div>` : ''}
                <div class="consumer-stats">
                    <span class="stat-item">
                        <i class="fas fa-paper-plane"></i>
                        ${consumer.webhookCount || 0} webhook
                    </span>
                    <span class="stat-item success">
                        <i class="fas fa-check"></i>
                        ${consumer.successfulWebhookCount || 0} başarılı
                    </span>
                    <span class="stat-item failed">
                        <i class="fas fa-times"></i>
                        ${consumer.failedWebhookCount || 0} başarısız
                    </span>
                </div>
                <div class="consumer-meta">
                    <small>Kayıt: ${formatDate(consumer.createdAt)}</small>
                    ${consumer.lastWebhookSent ? `<small>Son webhook: ${formatDate(consumer.lastWebhookSent)}</small>` : ''}
                </div>
            </div>
            <div class="consumer-actions">
                <button class="btn btn-sm btn-primary" onclick="sendTestWebhook(${consumer.id})">
                    <i class="fas fa-paper-plane"></i> Test
                </button>
                <button class="btn btn-sm btn-info" onclick="showUpdateConsumerModal(${consumer.id})">
                    <i class="fas fa-edit"></i> Güncelle
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteConsumer(${consumer.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Update consumer count
function updateConsumerCount(count) {
    document.getElementById('consumerCount').textContent = count;
}

// Show register consumer modal
function showRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'block';
}

// Close register consumer modal
function closeRegisterConsumerModal() {
    document.getElementById('registerConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('consumerName').value = '';
    document.getElementById('callbackUrl').value = '';
    document.getElementById('consumerDescription').value = '';
}

// Register webhook consumer
async function registerWebhookConsumer() {
    const consumerName = document.getElementById('consumerName').value.trim();
    const callbackUrl = document.getElementById('callbackUrl').value.trim();
    const description = document.getElementById('consumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeRegisterConsumerModal();
            loadWebhookConsumers();
            showNotification('Consumer başarıyla kaydedildi!', 'success');
        } else {
            showNotification(result.message || 'Consumer kaydedilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error registering consumer:', error);
        showNotification('Consumer kaydedilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Delete consumer
async function deleteConsumer(consumerId) {
    if (!confirm('Consumer\'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer silindi!', 'success');
        } else {
            showNotification(result.message || 'Consumer silinemedi!', 'error');
        }

    } catch (error) {
        console.error('Error deleting consumer:', error);
        showNotification('Consumer silinirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Send test webhook
async function sendTestWebhook(consumerId) {
    const testData = `Test Webhook Verisi:
• TC ID: TEST_TC_ID
• Miktar: 1.00 TRY
• İşlem ID: TEST_TRANSACTION_ID
• Kaynak: BANK_TRANSFER
• Açıklama: Test webhook from KHIK Bank Module

Bu test verisini göndermek istediğinizden emin misiniz?`;

    if (!confirm(testData)) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}/test`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderildi!', 'success');
            loadWebhookConsumers(); // Refresh to update stats
        } else {
            const result = await response.text();
            showNotification(result || 'Test webhook gönderilemedi!', 'error');
        }

    } catch (error) {
        console.error('Error sending test webhook:', error);
        showNotification('Test webhook gönderilirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Show update consumer modal
function showUpdateConsumerModal(consumerId) {
    // Find consumer data
    const consumers = JSON.parse(sessionStorage.getItem('webhookConsumers') || '[]');
    const consumer = consumers.find(c => c.id === consumerId);

    if (consumer) {
        // Fill form with current data
        document.getElementById('updateConsumerId').value = consumer.id;
        document.getElementById('updateConsumerName').value = consumer.consumerName;
        document.getElementById('updateCallbackUrl').value = consumer.callbackUrl;
        document.getElementById('updateConsumerDescription').value = consumer.description || '';

        // Show modal
        document.getElementById('updateConsumerModal').style.display = 'block';
    } else {
        showNotification('Consumer bilgileri bulunamadı!', 'error');
    }
}

// Close update consumer modal
function closeUpdateConsumerModal() {
    document.getElementById('updateConsumerModal').style.display = 'none';
    // Clear form
    document.getElementById('updateConsumerId').value = '';
    document.getElementById('updateConsumerName').value = '';
    document.getElementById('updateCallbackUrl').value = '';
    document.getElementById('updateConsumerDescription').value = '';
}

// Update webhook consumer
async function updateWebhookConsumer() {
    const consumerId = document.getElementById('updateConsumerId').value;
    const consumerName = document.getElementById('updateConsumerName').value.trim();
    const callbackUrl = document.getElementById('updateCallbackUrl').value.trim();
    const description = document.getElementById('updateConsumerDescription').value.trim();

    if (!consumerName || !callbackUrl) {
        alert('Consumer adı ve callback URL zorunludur!');
        return;
    }

    if (!callbackUrl.startsWith('http://') && !callbackUrl.startsWith('https://')) {
        alert('Callback URL http:// veya https:// ile başlamalıdır!');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/webhook/consumers/${consumerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                consumerName: consumerName,
                callbackUrl: callbackUrl,
                description: description
            })
        });

        const result = await response.json();

        if (response.ok) {
            closeUpdateConsumerModal();
            loadWebhookConsumers();
            showNotification(result.message || 'Consumer başarıyla güncellendi!', 'success');
        } else {
            showNotification(result.message || 'Consumer güncellenemedi!', 'error');
        }

    } catch (error) {
        console.error('Error updating consumer:', error);
        showNotification('Consumer güncellenirken hata oluştu!', 'error');
    } finally {
        hideLoading();
    }
}