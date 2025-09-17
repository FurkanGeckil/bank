package tr.com.khik.bank.module.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tr.com.khik.bank.module.dto.WebhookRegisterRequest;
import tr.com.khik.bank.module.dto.WebhookRegisterResponse;
import tr.com.khik.bank.module.entity.WebhookConsumer;
import tr.com.khik.bank.module.service.WebhookRegisterService;
import tr.com.khik.bank.module.service.WebhookService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/khik-bank/webhook")
@CrossOrigin(origins = "*")
public class WebhookRegisterController {

    private static final Logger logger = LoggerFactory.getLogger(WebhookRegisterController.class);

    @Autowired
    private WebhookRegisterService webhookRegisterService;

    @Autowired
    private WebhookService webhookService;

    /**
     * Yeni bir webhook consumer kaydeder
     * POST /khik-bank/webhook/register
     */
    @PostMapping("/register")
    public ResponseEntity<WebhookRegisterResponse> registerWebhookConsumer(
            @Valid @RequestBody WebhookRegisterRequest request) {
        
        logger.info("Register webhook consumer request received - ConsumerName: {}, CallbackUrl: {}", 
                   request.getConsumerName(), request.getCallbackUrl());
        
        WebhookRegisterResponse response = webhookRegisterService.registerWebhookConsumer(request);
        
        logger.info("Webhook consumer registration completed - Status: {}, ConsumerId: {}", 
                   response.getStatus(), response.getConsumerId());
        
        return switch (response.getStatus()) {
            case "SUCCESS" -> ResponseEntity.ok(response);
            case "ALREADY_EXISTS" -> ResponseEntity.ok(response); // 200 OK - zaten mevcut
            case "NAME_EXISTS" -> ResponseEntity.badRequest().body(response);
            case "CALLBACK_URL_EXISTS" -> ResponseEntity.badRequest().body(response);
            case "ERROR" -> ResponseEntity.internalServerError().body(response);
            default -> ResponseEntity.badRequest().body(response);
        };
    }

    /**
     * Tüm webhook consumer'ları listeler
     * GET /khik-bank/webhook/consumers
     */
    @GetMapping("/consumers")
    public ResponseEntity<List<WebhookConsumer>> getAllConsumers() {
        try {
            List<WebhookConsumer> consumers = webhookRegisterService.getAllConsumers();
            return ResponseEntity.ok(consumers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    /**
     * Belirli bir consumer'ı ID ile getirir
     * GET /khik-bank/webhook/consumers/{consumerId}
     */
    @GetMapping("/consumers/{consumerId}")
    public ResponseEntity<?> getConsumerById(@PathVariable Long consumerId) {
        try {
            Optional<WebhookConsumer> consumer = webhookRegisterService.getConsumerById(consumerId);
            
            if (consumer.isPresent()) {
                return ResponseEntity.ok(consumer.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }


    /**
     * Consumer'ı günceller
     * PUT /khik-bank/webhook/consumers/{consumerId}
     */
    @PutMapping("/consumers/{consumerId}")
    public ResponseEntity<WebhookRegisterResponse> updateConsumer(
            @PathVariable Long consumerId,
            @Valid @RequestBody WebhookRegisterRequest request) {
        
        WebhookRegisterResponse response = webhookRegisterService.updateConsumer(consumerId, request);
        
        return switch (response.getStatus()) {
            case "UPDATED" -> ResponseEntity.ok(response);
            case "NOT_FOUND" -> ResponseEntity.notFound().build();
            case "NAME_EXISTS", "CALLBACK_URL_EXISTS" -> ResponseEntity.badRequest().body(response);
            case "ERROR" -> ResponseEntity.internalServerError().body(response);
            default -> ResponseEntity.badRequest().body(response);
        };
    }

    /**
     * Consumer'ı siler
     * DELETE /khik-bank/webhook/consumers/{consumerId}
     */
    @DeleteMapping("/consumers/{consumerId}")
    public ResponseEntity<WebhookRegisterResponse> deleteConsumer(@PathVariable Long consumerId) {
        WebhookRegisterResponse response = webhookRegisterService.deleteConsumer(consumerId);
        
        return switch (response.getStatus()) {
            case "DELETED" -> ResponseEntity.ok(response);
            case "NOT_FOUND" -> ResponseEntity.notFound().build();
            case "ERROR" -> ResponseEntity.internalServerError().body(response);
            default -> ResponseEntity.badRequest().body(response);
        };
    }

    /**
     * Webhook consumer istatistiklerini getirir
     * GET /khik-bank/webhook/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getWebhookStats() {
        try {
            long totalConsumers = webhookRegisterService.getTotalConsumerCount();
            List<WebhookConsumer> allConsumers = webhookRegisterService.getAllConsumers();
            
            long totalWebhooks = allConsumers.stream()
                    .mapToLong(WebhookConsumer::getWebhookCount)
                    .sum();
            
            long totalSuccessful = allConsumers.stream()
                    .mapToLong(WebhookConsumer::getSuccessfulWebhookCount)
                    .sum();
            
            long totalFailed = allConsumers.stream()
                    .mapToLong(WebhookConsumer::getFailedWebhookCount)
                    .sum();
            
            return ResponseEntity.ok(new WebhookStatsResponse(
                totalConsumers,
                totalWebhooks,
                totalSuccessful,
                totalFailed
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    /**
     * Webhook consumer istatistikleri için inner class
     */
    public static class WebhookStatsResponse {
        private long totalConsumers;
        private long totalWebhooks;
        private long totalSuccessful;
        private long totalFailed;

        public WebhookStatsResponse(long totalConsumers, long totalWebhooks, 
                                  long totalSuccessful, long totalFailed) {
            this.totalConsumers = totalConsumers;
            this.totalWebhooks = totalWebhooks;
            this.totalSuccessful = totalSuccessful;
            this.totalFailed = totalFailed;
        }

        // Getters
        public long getTotalConsumers() { return totalConsumers; }
        public long getTotalWebhooks() { return totalWebhooks; }
        public long getTotalSuccessful() { return totalSuccessful; }
        public long getTotalFailed() { return totalFailed; }
    }

    /**
     * Belirli bir consumer'a test webhook'u gönderir
     * POST /khik-bank/webhook/consumers/{consumerId}/test
     */
    @PostMapping("/consumers/{consumerId}/test")
    public ResponseEntity<?> sendTestWebhook(@PathVariable Long consumerId) {
        try {
            Optional<WebhookConsumer> consumer = webhookRegisterService.getConsumerById(consumerId);
            
            if (consumer.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            
            // Test webhook'u gönder
            webhookService.sendTestWebhook(consumerId);
            
            return ResponseEntity.ok("Test webhook sent successfully to " + consumer.get().getConsumerName());
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
