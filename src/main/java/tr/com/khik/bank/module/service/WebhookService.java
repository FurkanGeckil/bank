package tr.com.khik.bank.module.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tr.com.khik.bank.module.dto.WebhookRequest;
import tr.com.khik.bank.module.entity.WebhookLog;
import tr.com.khik.bank.module.entity.WebhookConsumer;
import tr.com.khik.bank.module.repository.WebhookLogRepository;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


@Service
public class WebhookService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);

    @Autowired
    private WebhookLogRepository webhookLogRepository;

    @Autowired
    private WebhookRegisterService webhookRegisterService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${webhook.transfer.url}")
    private String webhookUrl;

    private final ExecutorService executorService = Executors.newFixedThreadPool(5);

    public void sendTransferWebhook(WebhookRequest webhookRequest) {
        logger.info("=== STARTING WEBHOOK PROCESSING ===");
        logger.info("Transaction ID: {}", webhookRequest.getTransactionId());
        logger.info("TC ID: {}", webhookRequest.getTcId());
        logger.info("Amount: {}", webhookRequest.getAmount());

        // Yeni yöntem - kayıtlı consumer'lara gönder
        // ??
        sendWebhookToRegisteredConsumers(webhookRequest);
        
        logger.info("=== WEBHOOK PROCESSING COMPLETED ===");

    }

    /**
     * Kayıtlı tüm aktif webhook consumer'lara webhook gönderir
     */
    public void sendWebhookToRegisteredConsumers(WebhookRequest webhookRequest) {
        try {
            List<WebhookConsumer> activeConsumers = webhookRegisterService.getAllConsumers();
            
            logger.info("=== SENDING WEBHOOK TO {} REGISTERED CONSUMERS ===", activeConsumers.size());
            
            for (WebhookConsumer consumer : activeConsumers) {
                // Asenkron olarak webhook gönder
                CompletableFuture.runAsync(() -> {
                    sendWebhookToConsumer(webhookRequest, consumer);
                }, executorService);
            }
            
        } catch (Exception e) {
            logger.error("Error sending webhooks to registered consumers: {}", e.getMessage(), e);
        }
    }

    /**
     * Belirli bir consumer'a webhook gönderir
     */
    private void sendWebhookToConsumer(WebhookRequest webhookRequest, WebhookConsumer consumer) {
        // Webhook log kaydını oluştur
        WebhookLog webhookLog = new WebhookLog(
            webhookRequest.getTcId(),
            webhookRequest.getAmount().toString(),
            webhookRequest.getTransactionId(),
            webhookRequest.getSource().name(),
            webhookRequest.getDescription(),
            consumer.getCallbackUrl(),
            "PENDING"
        );
        
        
        try {
            logger.info("=== WEBHOOK CALL TO CONSUMER: {} ===", consumer.getConsumerName());
            logger.info("URL: {}", consumer.getCallbackUrl());
            logger.info("Payload: {}", webhookRequest.toString());
            
            // Webhook çağrısını yap
            restTemplate.postForEntity(consumer.getCallbackUrl(), webhookRequest, String.class);
            
            // Başarılı durumu güncelle
            webhookLog.setStatus("SUCCESS");
            webhookLogRepository.save(webhookLog);
            
            // Consumer istatistiklerini güncelle
            webhookRegisterService.updateWebhookStats(consumer.getId(), true);
            
            logger.info("=== WEBHOOK CALL SUCCESS TO: {} ===", consumer.getConsumerName());
            
        } catch (Exception e) {
            // Hata durumunu güncelle
            webhookLog.setStatus("FAILED");
            webhookLog.setErrorMessage(e.getMessage());
            webhookLogRepository.save(webhookLog);
            
            // Consumer istatistiklerini güncelle
            webhookRegisterService.updateWebhookStats(consumer.getId(), false);
            
            logger.error("=== WEBHOOK CALL FAILED TO: {} ===", consumer.getConsumerName());
            logger.error("Error: {}", e.getMessage(), e);
        }
    }

    /**
     * Belirli bir URL'e webhook gönderir (eski yöntem)
     */
    @SuppressWarnings("unused")
    private void sendWebhookToUrl(WebhookRequest webhookRequest, String url) {
        // Webhook log kaydını oluştur
        WebhookLog webhookLog = new WebhookLog(
            webhookRequest.getTcId(),
            webhookRequest.getAmount().toString(),
            webhookRequest.getTransactionId(),
            webhookRequest.getSource().name(),
            webhookRequest.getDescription(),
            url,
            "PENDING"
        );
        
        webhookLogRepository.save(webhookLog);
        
        try {
            logger.info("=== WEBHOOK CALL STARTED (LEGACY) ===");
            logger.info("URL: {}", url);
            logger.info("Payload: {}", webhookRequest.toString());
            
            // Webhook çağrısını yap
            restTemplate.postForEntity(url, webhookRequest, String.class);
            
            // Başarılı durumu güncelle
            webhookLog.setStatus("SUCCESS");
            webhookLogRepository.save(webhookLog);
            
            logger.info("=== WEBHOOK CALL SUCCESS (LEGACY) ===");
            
        } catch (Exception e) {
            // Hata durumunu güncelle
            webhookLog.setStatus("FAILED");
            webhookLog.setErrorMessage(e.getMessage());
            webhookLogRepository.save(webhookLog);
            
            logger.error("=== WEBHOOK CALL FAILED (LEGACY) ===");
            logger.error("Error: {}", e.getMessage(), e);
        }
    }

    /**
     * Belirli bir consumer'a test webhook'u gönderir
     */
    
    public void sendTestWebhook(Long consumerId) {
        try {
            var consumerOpt = webhookRegisterService.getConsumerById(consumerId);
            
            if (consumerOpt.isPresent()) {
                WebhookConsumer consumer = consumerOpt.get();
                
                // Test webhook request oluştur
                WebhookRequest testRequest = new WebhookRequest(
                    "56842151080",
                    java.math.BigDecimal.valueOf(1.00),
                    "55555555555",
                    tr.com.khik.bank.module.enums.TransferSource.BANK_TRANSFER,
                    "Test webhook from KHIK Bank Module"
                );
                
                sendWebhookToConsumer(testRequest, consumer);
                
            } else {
                logger.error("Consumer not found with ID: {}", consumerId);
            }
            
        } catch (Exception e) {
            logger.error("Error sending test webhook: {}", e.getMessage(), e);
        }
    }
}