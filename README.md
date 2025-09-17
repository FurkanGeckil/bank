# KHIK Bank Module

Bu proje, KHIK Bank için geliştirilmiş bir bankacılık simulator modülüdür. Spring Boot framework'ü kullanılarak geliştirilmiştir.

## Özellikler

- Hesap yönetimi (IBAN numarası, hesap adı ve bakiye)
- Hesap oluşturma (bakiye 0 ile başlar)
- Transfer işlemleri (sadece sistemde tanımlı hesaplar için)
- İşlem kayıtları
- REST API endpoints

## Teknolojiler

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database (File-based)
- Maven

## Kurulum ve Çalıştırma

### Docker ile Çalıştırma (Önerilen)

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd bank-module
```

2. Docker Compose ile çalıştırın:
```bash
# Uygulamayı başlat
docker-compose up -d

# Logları görüntüle
docker-compose logs -f bank-module

# Uygulamayı durdur
docker-compose down
```

3. Uygulamaya erişim:
- Web Dashboard: `http://localhost:8081`
- H2 Database Console: `http://localhost:8081/h2-console`
- Health Check: `http://localhost:8081/actuator/health`

### Manuel Kurulum

#### Gereksinimler
- Java 17 veya üzeri
- Maven 3.6 veya üzeri

#### Projeyi Çalıştırma

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd bank-module
```

2. Maven ile bağımlılıkları yükleyin:
```bash
mvn clean install
```

3. Uygulamayı çalıştırın:
```bash
mvn spring-boot:run
```

Uygulama varsayılan olarak `http://localhost:8081` adresinde çalışacaktır.

### Docker Komutları

```bash
# Docker image oluştur
docker build -t khik-bank-module .

# Container çalıştır
docker run -d -p 8081:8081 --name bank-module khik-bank-module

# Container durdur
docker stop bank-module

# Container sil
docker rm bank-module
```

## API Endpoints

### Hesap Yönetimi

#### Hesap Oluşturma
**POST** `/khik-bank/account/create`

Yeni hesap oluşturur. Bakiye otomatik olarak 0 ile başlar.

**Request Body:**
```json
{
    "accountId": "TR330006100519786457841326",
    "accountName": "Test Account"
}
```

**Response:**
```json
{
    "id": 1,
    "accountId": "TR330006100519786457841326",
    "accountName": "Test Account",
    "balance": 0.00,
    "currency": "TRY",
    "isActive": true
}
```

#### Hesap Bilgileri
**GET** `/khik-bank/account/{accountId}`

Belirtilen hesap ID'sine ait hesap bilgilerini getirir.

**Response:**
```json
{
    "id": 1,
    "accountId": "TR330006100519786457841326",
    "accountName": "Test Account",
    "balance": 1000.00,
    "currency": "TRY",
    "isActive": true
}
```

#### Hesap Silme
**DELETE** `/khik-bank/account/{accountId}`

Belirtilen hesabı ve ilgili tüm transactionları siler. Sadece sıfır bakiyeli hesaplar silinebilir.

**Response (Başarılı):**
```
"Account deleted successfully: TR330001002500000001234567"
```

**Response (Hata - Pozitif Bakiye):**
```
"Error: Cannot delete account with positive balance: TR330001002500000001234567. Current balance: 1000.00"
```

#### Hesap İşlemlerini Getir
**GET** `/khik-bank/account/transactions?accountId={accountId}`

Belirtilen hesabın tüm işlemlerini getirir (en güncelden en eskiye sıralı).

**Response:**
```json
[
    {
        "id": 1,
        "fromAccountId": "TR330006100519786457841326",
        "toAccountId": "TR330006100519786457841327",
        "amount": 1000.00,
        "description": "Maaş ödemesi",
        "tcId": "12345678901",
        "transactionDate": "2024-01-15T10:30:00",
        "status": "SUCCESS"
    }
]
```

### Transfer İşlemleri

#### Toplu Transfer İşlemi
**POST** `/khik-bank/transfer`

Toplu transfer işlemi gerçekleştirir. Birden fazla hesaba aynı anda transfer yapar.

**Request Body:**
```json
{
    "transfers": [
        {
            "bankAccountId": "TR330006100519786457841326",
            "amount": 1000.00,
            "description": "Maaş ödemesi",
            "tcId": "12345678901"
        },
        {
            "bankAccountId": "TR330006100519786457841327",
            "amount": 500.00,
            "description": "Bonus ödemesi",
            "tcId": "12345678902"
        }
    ]
}
```

**Response:**
```json
{
    "transfers": [
        {
            "transactionId": "1",
            "fromAccountId": "TR330006100519786457841326",
            "toAccountId": "TR330006100519786457841326",
            "amount": 1000.00,
            "description": "Maaş ödemesi",
            "tcId": "12345678901",
            "transactionDate": "2024-01-15T10:30:00",
            "status": "SUCCESS",
            "message": "Transfer completed successfully"
        },
        {
            "transactionId": "2",
            "fromAccountId": "TR330006100519786457841326",
            "toAccountId": "TR330006100519786457841327",
            "amount": 500.00,
            "description": "Bonus ödemesi",
            "tcId": "12345678902",
            "transactionDate": "2024-01-15T10:30:00",
            "status": "SUCCESS",
            "message": "Transfer completed successfully"
        }
    ],
    "status": "SUCCESS",
    "message": "2 out of 2 transfers completed successfully",
    "totalTransfers": 2,
    "successfulTransfers": 2,
    "failedTransfers": 0
}
```

### Hesap Listeleme

#### Tüm Hesapları Listele
**GET** `/khik-bank/list`

Sistemdeki tüm aktif hesapları ve bakiyelerini listeler.

**Response:**
```json
[
    {
        "id": 1,
        "accountId": "TR330006100519786457841326",
        "accountName": "KHIK Bank Account",
        "balance": 1000.00,
        "currency": "TRY",
        "isActive": true
    },
    {
        "id": 2,
        "accountId": "TR330006100519786457841327",
        "accountName": "Test Account",
        "balance": 0.00,
        "currency": "TRY",
        "isActive": true
    }
]
```

### Sistem Bilgileri

#### Sağlık Kontrolü
**GET** `/khik-bank/health`

Uygulamanın çalışır durumda olup olmadığını kontrol eder.

**Response:**
```
"KHIK Bank Module is running!"
```

#### İstatistikler
**GET** `/khik-bank/stats`

Sistemdeki toplam işlem sayısını getirir.

**Response:**
```json
{
    "totalTransactions": 150
}
```

#### TC Kimlik No'ya Göre İşlemler
**GET** `/khik-bank/transactions/by-tc`

Tüm işlemleri TC Kimlik No'ya göre gruplar.

**Response:**
```json
{
    "12345678901": [
        {
            "id": 1,
            "fromAccountId": "TR330006100519786457841326",
            "toAccountId": "TR330006100519786457841327",
            "amount": 1000.00,
            "description": "Maaş ödemesi",
            "tcId": "12345678901",
            "transactionDate": "2024-01-15T10:30:00",
            "status": "SUCCESS"
        }
    ]
}
```

#### Webhook Logları
**GET** `/khik-bank/webhook-logs`

Tüm webhook loglarını getirir.

**Response:**
```json
[
    {
        "id": 1,
        "consumerId": 1,
        "eventType": "TRANSFER_COMPLETED",
        "payload": "{\"transactionId\":\"1\",\"amount\":1000.00}",
        "responseStatus": 200,
        "responseBody": "OK",
        "createdAt": "2024-01-15T10:30:00"
    }
]
```

### Banka Ayarları

#### Banka Ayarlarını Getir
**GET** `/khik-bank/settings`

Mevcut banka ayarlarını getirir.

**Response:**
```json
{
    "id": 1,
    "bankIban": "TR330006100519786457841326",
    "bankName": "KHIK Bank",
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00"
}
```

#### Banka Ayarlarını Güncelle
**POST** `/khik-bank/settings`

Banka ayarlarını oluşturur veya günceller.

**Request Body:**
```json
{
    "bankIban": "TR330006100519786457841326",
    "bankName": "KHIK Bank"
}
```

**Response:**
```json
{
    "id": 1,
    "bankIban": "TR330006100519786457841326",
    "bankName": "KHIK Bank",
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00"
}
```

#### Banka Ayarlarını Sıfırla
**DELETE** `/khik-bank/settings`

Banka ayarlarını sıfırlar.

**Response:**
```
"Bank settings reset successfully"
```

### Webhook Yönetimi

#### Webhook Consumer Kaydet
**POST** `/khik-bank/webhook/register`

Yeni bir webhook consumer kaydeder.

**Request Body:**
```json
{
    "consumerName": "Test Consumer",
    "callbackUrl": "https://example.com/webhook",
    "description": "Test webhook consumer"
}
```

**Response:**
```json
{
    "consumerId": 1,
    "consumerName": "Test Consumer",
    "callbackUrl": "https://example.com/webhook",
    "description": "Test webhook consumer",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00",
    "status": "SUCCESS",
    "message": "Webhook consumer registered successfully"
}
```

#### Tüm Webhook Consumer'ları Listele
**GET** `/khik-bank/webhook/consumers`

Tüm webhook consumer'ları listeler.

**Response:**
```json
[
    {
        "id": 1,
        "consumerName": "Test Consumer",
        "callbackUrl": "https://example.com/webhook",
        "description": "Test webhook consumer",
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00"
    }
]
```

#### Webhook Consumer Getir
**GET** `/khik-bank/webhook/consumers/{consumerId}`

Belirli bir webhook consumer'ı getirir.

**Response:**
```json
{
    "id": 1,
    "consumerName": "Test Consumer",
    "callbackUrl": "https://example.com/webhook",
    "description": "Test webhook consumer",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00"
}
```

#### Webhook Consumer Güncelle
**PUT** `/khik-bank/webhook/consumers/{consumerId}`

Webhook consumer'ı günceller.

**Request Body:**
```json
{
    "consumerName": "Updated Consumer",
    "callbackUrl": "https://example.com/webhook-updated",
    "description": "Updated webhook consumer"
}
```

**Response:**
```json
{
    "consumerId": 1,
    "consumerName": "Updated Consumer",
    "callbackUrl": "https://example.com/webhook-updated",
    "description": "Updated webhook consumer",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00",
    "status": "UPDATED",
    "message": "Webhook consumer updated successfully"
}
```

#### Webhook Consumer Sil
**DELETE** `/khik-bank/webhook/consumers/{consumerId}`

Webhook consumer'ı siler.

**Response:**
```
"Webhook consumer deleted successfully"
```

## Veritabanı

Uygulama H2 dosya tabanlı veritabanı kullanmaktadır. Veritabanı dosyaları `data/` dizininde saklanmaktadır. Geliştirme aşamasında H2 Console'a `http://localhost:8081/h2-console` adresinden erişebilirsiniz.

**Veritabanı Bilgileri:**
- URL: `jdbc:h2:file:./data/bankdb`
- Username: `sa`
- Password: `password`
- Dosya Konumu: `./data/bankdb.mv.db`

## Proje Yapısı

```
src/
├── main/
│   ├── java/tr/com/khik/bank/module/
│   │   ├── controller/
│   │   │   ├── BankController.java
│   │   │   ├── BankSettingsController.java
│   │   │   └── WebhookRegisterController.java
│   │   ├── dto/
│   │   │   ├── BankSettingsRequest.java
│   │   │   ├── BulkTransferRequest.java
│   │   │   ├── BulkTransferResponse.java
│   │   │   ├── CreateAccountRequest.java
│   │   │   ├── StatsResponse.java
│   │   │   ├── TransferRequest.java
│   │   │   ├── TransferResponse.java
│   │   │   ├── WebhookRegisterRequest.java
│   │   │   ├── WebhookRegisterResponse.java
│   │   │   └── WebhookRequest.java
│   │   ├── entity/
│   │   │   ├── Account.java
│   │   │   ├── BankSettings.java
│   │   │   ├── Transaction.java
│   │   │   ├── WebhookConsumer.java
│   │   │   └── WebhookLog.java
│   │   ├── enums/
│   │   │   └── TransferSource.java
│   │   ├── repository/
│   │   │   ├── AccountRepository.java
│   │   │   ├── BankSettingsRepository.java
│   │   │   ├── TransactionRepository.java
│   │   │   ├── WebhookConsumerRepository.java
│   │   │   └── WebhookLogRepository.java
│   │   ├── service/
│   │   │   ├── BankService.java
│   │   │   ├── BankSettingsService.java
│   │   │   ├── WebhookRegisterService.java
│   │   │   └── WebhookService.java
│   │   ├── validation/
│   │   │   ├── TcKimlikNoValidator.java
│   │   │   └── ValidTcKimlikNo.java
│   │   ├── config/
│   │   │   └── WebConfig.java
│   │   └── BankModuleApplication.java
│   └── resources/
│       ├── application.properties
│       └── static/
│           ├── index.html
│           ├── script.js
│           └── styles.css
└── test/
    └── java/tr/com/khik/bank/module/
        └── BankModuleApplicationTests.java
```

## Kullanım Akışı

### 1. Sistem Kontrolü
Önce sistemin çalışır durumda olduğunu kontrol edin:
```bash
curl -X GET http://localhost:8081/khik-bank/health
```

### 2. Banka Ayarlarını Yapılandırma
Banka ayarlarını oluşturun:
```bash
curl -X POST http://localhost:8081/khik-bank/settings \
  -H "Content-Type: application/json" \
  -d '{"bankIban": "TR330006100519786457841326", "bankName": "KHIK Bank"}'
```

### 3. Webhook Consumer Kaydetme
Webhook consumer kaydedin:
```bash
curl -X POST http://localhost:8081/khik-bank/webhook/register \
  -H "Content-Type: application/json" \
  -d '{"consumerName": "Test Consumer", "callbackUrl": "https://example.com/webhook", "description": "Test webhook consumer"}'
```

### 4. Hesap Oluşturma
Hesap oluşturun:
```bash
curl -X POST http://localhost:8081/khik-bank/account/create \
  -H "Content-Type: application/json" \
  -d '{"accountId": "TR330006100519786457841326", "accountName": "Test Account"}'
```

### 5. Toplu Transfer İşlemi
Hesap oluşturulduktan sonra toplu transfer yapın:
```bash
curl -X POST http://localhost:8081/khik-bank/transfer \
  -H "Content-Type: application/json" \
  -d '{"transfers": [{"bankAccountId": "TR330006100519786457841326", "amount": 1000.00, "description": "Maaş ödemesi", "tcId": "12345678901"}, {"bankAccountId": "TR330006100519786457841327", "amount": 500.00, "description": "Bonus ödemesi", "tcId": "12345678902"}]}'
```

### 6. Hesap Bilgileri Kontrolü
```bash
curl -X GET http://localhost:8081/khik-bank/account/TR330006100519786457841326
```

### 7. Hesap İşlemlerini Listeleme
```bash
curl -X GET "http://localhost:8081/khik-bank/account/transactions?accountId=TR330006100519786457841326"
```

### 8. Tüm Hesapları Listeleme
```bash
curl -X GET http://localhost:8081/khik-bank/list
```

### 9. İstatistikleri Görüntüleme
```bash
curl -X GET http://localhost:8081/khik-bank/stats
```

### 10. TC Kimlik No'ya Göre İşlemleri Görüntüleme
```bash
curl -X GET http://localhost:8081/khik-bank/transactions/by-tc
```

### 11. Webhook Loglarını Görüntüleme
```bash
curl -X GET http://localhost:8081/khik-bank/webhook-logs
```

### 12. Hesap Silme (Opsiyonel)
```bash
curl -X DELETE http://localhost:8081/khik-bank/account/TR330001002500000001234567
```

## Postman Collection

API'yi test etmek için Postman collection'ı kullanabilirsiniz:

1. `KHIK_Bank_Module.postman_collection.json` dosyasını Postman'e import edin
2. `KHIK_Bank_Module.postman_environment.json` environment dosyasını import edin
3. Detaylı kullanım kılavuzu için `POSTMAN_GUIDE.md` dosyasını inceleyin

## Yeni Yapı Değişiklikleri

### Account-Only Structure
- Bank entity'si kaldırıldı
- Account entity'si genişletildi (accountName, isActive alanları eklendi)
- Hesap oluşturma endpoint'i eklendi
- Transfer işlemi sadece sistemde tanımlı hesaplar için çalışır

### Veritabanı Şeması
- `accounts` tablosu: id, accountId, accountName, balance, currency, isActive
- `transactions` tablosu: id, fromAccountId, toAccountId, amount, description, tcId, transactionDate, status
- `bank_settings` tablosu: id, bankIban, bankName, createdAt, updatedAt
- `webhook_consumers` tablosu: id, consumerName, callbackUrl, description, isActive, createdAt
- `webhook_logs` tablosu: id, consumerId, eventType, payload, responseStatus, responseBody, createdAt

