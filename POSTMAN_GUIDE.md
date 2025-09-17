# KHIK Bank Module - Postman Kullanım Kılavuzu

Bu kılavuz, KHIK Bank Module API'sini Postman ile test etmek için hazırlanmıştır.

## Kurulum

### 1. Postman Collection'ını İçe Aktarma

1. Postman uygulamasını açın
2. **Import** butonuna tıklayın
3. `KHIK_Bank_Module.postman_collection.json` dosyasını seçin ve içe aktarın

### 2. Environment Kurulumu

1. **Import** butonuna tıklayın
2. `KHIK_Bank_Module.postman_environment.json` dosyasını seçin ve içe aktarın
3. Sağ üst köşeden "KHIK Bank Module Environment" environment'ını seçin

## API Endpoints

### 1. Health Check
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/health`
- **Açıklama**: Uygulamanın çalışır durumda olup olmadığını kontrol eder
- **Beklenen Yanıt**: `"KHIK Bank Module is running!"`

### 2. Hesap Oluşturma
- **Method**: POST
- **URL**: `{{base_url}}/khik-bank/account/create`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
    "accountId": "TR330006100519786457841326",
    "accountName": "Test Account"
}
```
- **Açıklama**: Yeni hesap oluşturur. Bakiye otomatik olarak 0 ile başlar
- **Beklenen Yanıt**:
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

### 3. Hesap Bilgileri
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/account/TR330006100519786457841326`
- **Açıklama**: Belirtilen hesap ID'sine ait hesap bilgilerini getirir
- **Beklenen Yanıt**:
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

### 4. Hesap Silme
- **Method**: DELETE
- **URL**: `{{base_url}}/khik-bank/account/TR330001002500000001234567`
- **Açıklama**: Belirtilen hesabı ve ilgili tüm transactionları siler
- **Güvenlik Kontrolleri**:
  - KHIK Bank hesabı silinemez
  - Pozitif bakiyeli hesaplar silinemez
  - Sistemde olmayan hesaplar silinemez
- **Beklenen Yanıt (Başarılı)**:
```
"Account deleted successfully: TR330001002500000001234567"
```
- **Beklenen Yanıt (Hata - Pozitif Bakiye)**:
```
"Error: Cannot delete account with positive balance: TR330001002500000001234567. Current balance: 1000.00"
```
- **Beklenen Yanıt (Hata - KHIK Bank Hesabı)**:
```
"Error: Cannot delete KHIK Bank account"
```
- **Beklenen Yanıt (Hata - Hesap Bulunamadı)**:
```
"Error: Account not found: TR330001002500000009999999"
```

### 5. Toplu Transfer İşlemi
- **Method**: POST
- **URL**: `{{base_url}}/khik-bank/transfer`
- **Headers**: `Content-Type: application/json`
- **Body**:
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
- **Açıklama**: Toplu transfer işlemi gerçekleştirir. Birden fazla hesaba aynı anda transfer yapar.
- **Beklenen Yanıt**:
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

### 5. Tüm Hesapları Listele
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/list`
- **Açıklama**: Sistemdeki tüm aktif hesapları ve bakiyelerini listeler
- **Beklenen Yanıt**:
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

### 6. H2 Console
- **Method**: GET
- **URL**: `{{base_url}}/h2-console`
- **Açıklama**: H2 Database Console'a erişim sağlar

### 7. İstatistikler
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/stats`
- **Açıklama**: Sistemdeki toplam işlem sayısını getirir
- **Beklenen Yanıt**:
```json
{
    "totalTransactions": 150
}
```

### 8. TC Kimlik No'ya Göre İşlemler
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/transactions/by-tc`
- **Açıklama**: Tüm işlemleri TC Kimlik No'ya göre gruplar
- **Beklenen Yanıt**:
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

### 9. Webhook Logları
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/webhook-logs`
- **Açıklama**: Tüm webhook loglarını getirir
- **Beklenen Yanıt**:
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

### 10. Banka Ayarlarını Getir
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/settings`
- **Açıklama**: Mevcut banka ayarlarını getirir
- **Beklenen Yanıt**:
```json
{
    "id": 1,
    "bankIban": "TR330006100519786457841326",
    "bankName": "KHIK Bank",
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00"
}
```

### 11. Banka Ayarlarını Güncelle
- **Method**: POST
- **URL**: `{{base_url}}/khik-bank/settings`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
    "bankIban": "TR330006100519786457841326",
    "bankName": "KHIK Bank"
}
```
- **Açıklama**: Banka ayarlarını oluşturur veya günceller
- **Beklenen Yanıt**:
```json
{
    "id": 1,
    "bankIban": "TR330006100519786457841326",
    "bankName": "KHIK Bank",
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:00:00"
}
```

### 12. Banka Ayarlarını Sıfırla
- **Method**: DELETE
- **URL**: `{{base_url}}/khik-bank/settings`
- **Açıklama**: Banka ayarlarını sıfırlar
- **Beklenen Yanıt**:
```
"Bank settings reset successfully"
```

### 13. Webhook Consumer Kaydet
- **Method**: POST
- **URL**: `{{base_url}}/khik-bank/webhook/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
    "consumerName": "Test Consumer",
    "callbackUrl": "https://example.com/webhook",
    "description": "Test webhook consumer"
}
```
- **Açıklama**: Yeni bir webhook consumer kaydeder
- **Beklenen Yanıt**:
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

### 14. Tüm Webhook Consumer'ları Listele
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/webhook/consumers`
- **Açıklama**: Tüm webhook consumer'ları listeler
- **Beklenen Yanıt**:
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

### 15. Webhook Consumer Getir
- **Method**: GET
- **URL**: `{{base_url}}/khik-bank/webhook/consumers/{consumerId}`
- **Açıklama**: Belirli bir webhook consumer'ı getirir
- **Beklenen Yanıt**:
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

### 16. Webhook Consumer Güncelle
- **Method**: PUT
- **URL**: `{{base_url}}/khik-bank/webhook/consumers/{consumerId}`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
    "consumerName": "Updated Consumer",
    "callbackUrl": "https://example.com/webhook-updated",
    "description": "Updated webhook consumer"
}
```
- **Açıklama**: Webhook consumer'ı günceller
- **Beklenen Yanıt**:
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

### 17. Webhook Consumer Sil
- **Method**: DELETE
- **URL**: `{{base_url}}/khik-bank/webhook/consumers/{consumerId}`
- **Açıklama**: Webhook consumer'ı siler
- **Beklenen Yanıt**:
```
"Webhook consumer deleted successfully"
```

## Test Senaryoları

### Başarılı Senaryolar

1. **Health Check Test**: Uygulamanın çalışır durumda olduğunu doğrular
2. **Banka Ayarları**: Banka ayarlarını oluşturur, günceller ve getirir
3. **Webhook Consumer**: Webhook consumer kaydeder, günceller, listeler ve siler
4. **Hesap Oluşturma**: Yeni hesap oluşturur ve bakiye 0 ile başlar
5. **Hesap Bilgileri**: Mevcut hesap bilgilerini getirir
6. **Toplu Transfer İşlemi**: Birden fazla hesaba aynı anda transfer işlemi gerçekleştirir
7. **Tüm Hesapları Listeleme**: Sistemdeki tüm aktif hesapları listeler
8. **İstatistikler**: Sistemdeki toplam işlem sayısını getirir
9. **TC Kimlik No'ya Göre İşlemler**: İşlemleri TC Kimlik No'ya göre gruplar
10. **Webhook Logları**: Tüm webhook loglarını getirir

### Hata Senaryoları

1. **Geçersiz IBAN**: IBAN formatı geçersiz olduğunda hata döner (kısmi başarı senaryosu)
2. **Boş Hesap Adı**: Hesap adı boş olduğunda hata döner
3. **Geçersiz TC Kimlik**: TC Kimlik No 11 haneli olmadığında hata döner
4. **Negatif Miktar**: Miktar 0.01'den küçük olduğunda hata döner
5. **Mevcut Olmayan Hesap**: Hesap bulunamadığında 404 hatası döner
6. **Sistemde Olmayan Hesap**: Transfer için hesap sistemde tanımlı değilse hata döner
7. **Kısmi Başarı**: Bazı transferler başarılı, bazıları başarısız olduğunda PARTIAL_SUCCESS döner
8. **Geçersiz Webhook URL**: Webhook callback URL'i geçersiz olduğunda hata döner
9. **Boş Webhook İsim**: Webhook consumer ismi boş olduğunda hata döner
10. **Mevcut Olmayan Webhook Consumer**: Webhook consumer bulunamadığında 404 hatası döner

## Environment Değişkenleri

| Değişken | Değer | Açıklama |
|----------|-------|----------|
| `base_url` | `http://localhost:8081` | API'nin temel URL'i |
| `khik_account_id` | `TR330006100519786457841326` | KHIK Bank hesap ID'si |
| `test_account_name` | `Test Account` | Test için hesap adı |
| `test_tc_id` | `12345678901` | Test için TC Kimlik No |
| `test_amount` | `1000.00` | Test için transfer miktarı |
| `invalid_iban` | `INVALID_IBAN` | Geçersiz IBAN testi için |
| `non_existent_account` | `TR330006100519786457841327` | Mevcut olmayan hesap testi için |

## Kullanım Adımları

### 1. Uygulamayı Başlatma
```bash
mvn spring-boot:run
```

### 2. Health Check
- "Health Check" request'ini çalıştırın
- `200 OK` yanıtı almalısınız

### 3. Hesap Oluşturma
- "Hesap Oluştur" request'ini çalıştırın
- `200 OK` yanıtı ve yeni hesap bilgileri almalısınız
- Bakiye 0.00 olarak başlamalı

### 4. Toplu Transfer İşlemi Testi
- "Toplu Transfer İşlemi" request'ini çalıştırın
- `200 OK` yanıtı ve başarılı transfer mesajı almalısınız

### 5. Hesap Bilgileri Kontrolü
- "Hesap Bilgileri - KHIK Bank" request'ini çalıştırın
- Güncel bakiye bilgisini görmelisiniz

### 6. Hesap Silme Testi
- "Hesap Sil" request'ini çalıştırın (sadece sıfır bakiyeli hesaplar için)
- `200 OK` yanıtı ve silme onayı almalısınız
- "Hesap Sil - Pozitif Bakiyeli" ile hata testi yapın
- "Hesap Sil - KHIK Bank Hesabı" ile koruma testi yapın

### 7. Tüm Hesapları Listeleme
- "Tüm Hesapları Listele" request'ini çalıştırın
- Sistemdeki tüm aktif hesapları, bakiyelerini ve transaction'larını görmelisiniz

### 8. Banka Ayarları Testi
- "Banka Ayarlarını Güncelle" request'ini çalıştırın
- `200 OK` yanıtı ve banka ayarları almalısınız
- "Banka Ayarlarını Getir" ile ayarları kontrol edin

### 9. Webhook Consumer Testi
- "Webhook Consumer Kaydet" request'ini çalıştırın
- `200 OK` yanıtı ve consumer bilgileri almalısınız
- "Tüm Webhook Consumer'ları Listele" ile listeyi kontrol edin
- "Webhook Consumer Güncelle" ile güncelleme yapın
- "Webhook Consumer Sil" ile silme işlemi yapın

### 10. İstatistikler Testi
- "İstatistikler" request'ini çalıştırın
- `200 OK` yanıtı ve toplam işlem sayısı almalısınız

### 11. TC Kimlik No'ya Göre İşlemler Testi
- "TC Kimlik No'ya Göre İşlemler" request'ini çalıştırın
- `200 OK` yanıtı ve gruplandırılmış işlemler almalısınız

### 12. Webhook Logları Testi
- "Webhook Logları" request'ini çalıştırın
- `200 OK` yanıtı ve webhook logları almalısınız

### 13. Hata Senaryoları Testi
- Hata request'lerini sırayla çalıştırın
- Uygun hata mesajları almalısınız

## Veritabanı Kontrolü

### H2 Console Erişimi
1. "H2 Console" request'ini çalıştırın
2. Tarayıcıda H2 Console açılacaktır
3. Veritabanı bilgileri:
   - **JDBC URL**: `jdbc:h2:file:./data/bankdb`
   - **Username**: `sa`
   - **Password**: `password`

### Veritabanı Tabloları
- `accounts`: Hesap bilgileri (accountId, accountName, balance, currency, isActive)
- `transactions`: İşlem kayıtları
- `bank_settings`: Banka ayarları (bankIban, bankName, createdAt, updatedAt)
- `webhook_consumers`: Webhook consumer'ları (consumerName, callbackUrl, description, isActive, createdAt)
- `webhook_logs`: Webhook logları (consumerId, eventType, payload, responseStatus, responseBody, createdAt)

## Yeni Yapı Değişiklikleri

### Account-Only Structure
- Bank entity'si kaldırıldı
- Account entity'si genişletildi (accountName, isActive alanları eklendi)
- Hesap oluşturma endpoint'i eklendi
- Transfer işlemi sadece sistemde tanımlı hesaplar için çalışır

### Hesap Oluşturma Süreci
1. Önce hesap oluşturulmalı (`/khik-bank/account/create`)
2. Hesap bakiye 0 ile başlar
3. Transfer işlemi sadece oluşturulan hesaplar için yapılabilir

### Yeni Özellikler
- **Banka Ayarları**: Banka IBAN ve ismi yönetimi
- **Webhook Sistemi**: Webhook consumer kaydı ve yönetimi
- **İstatistikler**: Sistemdeki toplam işlem sayısı
- **TC Kimlik No Gruplama**: İşlemleri TC Kimlik No'ya göre gruplama
- **Webhook Logları**: Webhook çağrılarının logları

## Sorun Giderme

### Uygulama Başlatılamıyorsa
1. Port 8081'in kullanılabilir olduğundan emin olun
2. Java 17'nin yüklü olduğunu kontrol edin
3. Maven bağımlılıklarının yüklendiğini kontrol edin

### API Yanıt Vermiyorsa
1. Uygulamanın çalışır durumda olduğunu kontrol edin
2. Health Check endpoint'ini test edin
3. Log dosyalarını kontrol edin

### Veritabanı Sorunları
1. `data/` dizininin mevcut olduğunu kontrol edin
2. H2 Console'a erişim sağlayın
3. Veritabanı dosyalarının oluşturulduğunu kontrol edin

### Transfer İşlemi Başarısız Oluyorsa
1. Hesabın önceden oluşturulduğundan emin olun
2. Hesap ID'sinin doğru olduğunu kontrol edin
3. Hesabın aktif (isActive: true) olduğunu kontrol edin

### Webhook Consumer Sorunları
1. Webhook consumer'ın kayıtlı olduğundan emin olun
2. Callback URL'in geçerli olduğunu kontrol edin
3. Webhook loglarını kontrol edin
4. Consumer'ın aktif (isActive: true) olduğunu kontrol edin

### Banka Ayarları Sorunları
1. Banka ayarlarının yapılandırıldığından emin olun
2. IBAN formatının doğru olduğunu kontrol edin
3. Banka ayarlarını sıfırlayıp yeniden yapılandırın

## İletişim

Herhangi bir sorun yaşarsanız, lütfen geliştirme ekibi ile iletişime geçin.
