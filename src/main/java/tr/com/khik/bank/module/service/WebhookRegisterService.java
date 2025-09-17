package tr.com.khik.bank.module.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.com.khik.bank.module.dto.WebhookRegisterRequest;
import tr.com.khik.bank.module.dto.WebhookRegisterResponse;
import tr.com.khik.bank.module.entity.WebhookConsumer;
import tr.com.khik.bank.module.repository.WebhookConsumerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WebhookRegisterService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookRegisterService.class);

    @Autowired
    private WebhookConsumerRepository webhookConsumerRepository;

    /**
     * Yeni bir webhook consumer kaydeder
     */
    @Transactional
    public WebhookRegisterResponse registerWebhookConsumer(WebhookRegisterRequest request) {
        try {
            // Aynı callback URL'e sahip consumer var mı kontrol et
            Optional<WebhookConsumer> existingConsumer = webhookConsumerRepository
                    .findByCallbackUrl(request.getCallbackUrl());
            
            if (existingConsumer.isPresent()) {
                return new WebhookRegisterResponse(
                    existingConsumer.get().getId(),
                    existingConsumer.get().getConsumerName(),
                    existingConsumer.get().getCallbackUrl(),
                    existingConsumer.get().getDescription(),
                    true, // Her zaman aktif
                    existingConsumer.get().getCreatedAt(),
                    "ALREADY_EXISTS",
                    "Webhook consumer with this callback URL already exists"
                );
            }

            // Aynı isme sahip consumer var mı kontrol et
            Optional<WebhookConsumer> existingByName = webhookConsumerRepository
                    .findByConsumerName(request.getConsumerName());
            
            if (existingByName.isPresent()) {
                return new WebhookRegisterResponse(
                    null, null, null, null, null, null,
                    "NAME_EXISTS",
                    "Webhook consumer with this name already exists"
                );
            }

            // Yeni consumer oluştur
            WebhookConsumer consumer = new WebhookConsumer(
                request.getConsumerName(),
                request.getCallbackUrl(),
                request.getDescription()
            );

            WebhookConsumer savedConsumer = webhookConsumerRepository.save(consumer);

            return new WebhookRegisterResponse(
                savedConsumer.getId(),
                savedConsumer.getConsumerName(),
                savedConsumer.getCallbackUrl(),
                savedConsumer.getDescription(),
                true, // Her zaman aktif
                savedConsumer.getCreatedAt(),
                "SUCCESS",
                "Webhook consumer registered successfully"
            );

        } catch (Exception e) {
            return new WebhookRegisterResponse(
                null, null, null, null, null, null,
                "ERROR",
                "Failed to register webhook consumer: " + e.getMessage()
            );
        }
    }

    /**
     * Tüm webhook consumer'ları getirir
     */
    public List<WebhookConsumer> getAllConsumers() {
        return webhookConsumerRepository.findAll();
    }

    /**
     * Belirli bir consumer'ı ID ile getirir
     */
    public Optional<WebhookConsumer> getConsumerById(Long consumerId) {
        return webhookConsumerRepository.findById(consumerId);
    }


    /**
     * Consumer'ı siler
     */
    @Transactional
    public WebhookRegisterResponse deleteConsumer(Long consumerId) {
        try {
            Optional<WebhookConsumer> consumerOpt = webhookConsumerRepository.findById(consumerId);
            
            if (consumerOpt.isEmpty()) {
                return new WebhookRegisterResponse(
                    null, null, null, null, null, null,
                    "NOT_FOUND",
                    "Webhook consumer not found"
                );
            }

            WebhookConsumer consumer = consumerOpt.get();
            webhookConsumerRepository.delete(consumer);

            return new WebhookRegisterResponse(
                consumerId,
                consumer.getConsumerName(),
                consumer.getCallbackUrl(),
                consumer.getDescription(),
                true, // Her zaman aktif
                consumer.getCreatedAt(),
                "DELETED",
                "Webhook consumer deleted successfully"
            );

        } catch (Exception e) {
            return new WebhookRegisterResponse(
                null, null, null, null, null, null,
                "ERROR",
                "Failed to delete webhook consumer: " + e.getMessage()
            );
        }
    }

    /**
     * Consumer'ı günceller
     */
    @Transactional
    public WebhookRegisterResponse updateConsumer(Long consumerId, WebhookRegisterRequest request) {
        try {
            Optional<WebhookConsumer> consumerOpt = webhookConsumerRepository.findById(consumerId);
            
            if (consumerOpt.isEmpty()) {
                return new WebhookRegisterResponse(
                    null, null, null, null, null, null,
                    "NOT_FOUND",
                    "Webhook consumer not found"
                );
            }

            WebhookConsumer consumer = consumerOpt.get();
            
            // Aynı callback URL'e sahip başka bir consumer var mı kontrol et
            Optional<WebhookConsumer> existingConsumer = webhookConsumerRepository
                    .findByCallbackUrl(request.getCallbackUrl());
            
            if (existingConsumer.isPresent() && !existingConsumer.get().getId().equals(consumerId)) {
                return new WebhookRegisterResponse(
                    null, null, null, null, null, null,
                    "CALLBACK_URL_EXISTS",
                    "Another webhook consumer with this callback URL already exists"
                );
            }

            // Aynı isme sahip başka bir consumer var mı kontrol et
            Optional<WebhookConsumer> existingByName = webhookConsumerRepository
                    .findByConsumerName(request.getConsumerName());
            
            if (existingByName.isPresent() && !existingByName.get().getId().equals(consumerId)) {
                return new WebhookRegisterResponse(
                    null, null, null, null, null, null,
                    "NAME_EXISTS",
                    "Another webhook consumer with this name already exists"
                );
            }

            // Consumer bilgilerini güncelle
            consumer.setConsumerName(request.getConsumerName());
            consumer.setCallbackUrl(request.getCallbackUrl());
            consumer.setDescription(request.getDescription());

            WebhookConsumer updatedConsumer = webhookConsumerRepository.save(consumer);

            return new WebhookRegisterResponse(
                updatedConsumer.getId(),
                updatedConsumer.getConsumerName(),
                updatedConsumer.getCallbackUrl(),
                updatedConsumer.getDescription(),
                true, // Her zaman aktif
                updatedConsumer.getCreatedAt(),
                "UPDATED",
                "Webhook consumer updated successfully"
            );

        } catch (Exception e) {
            return new WebhookRegisterResponse(
                null, null, null, null, null, null,
                "ERROR",
                "Failed to update webhook consumer: " + e.getMessage()
            );
        }
    }

    /**
     * Webhook gönderim istatistiklerini günceller
     */
    @Transactional
    public void updateWebhookStats(Long consumerId, boolean success) {
        try {
            Optional<WebhookConsumer> consumerOpt = webhookConsumerRepository.findById(consumerId);
            
            if (consumerOpt.isPresent()) {
                WebhookConsumer consumer = consumerOpt.get();
                consumer.setWebhookCount(consumer.getWebhookCount() + 1);
                consumer.setLastWebhookSent(LocalDateTime.now());
                
                if (success) {
                    consumer.setSuccessfulWebhookCount(consumer.getSuccessfulWebhookCount() + 1);
                } else {
                    consumer.setFailedWebhookCount(consumer.getFailedWebhookCount() + 1);
                }
                
                webhookConsumerRepository.save(consumer);
            }
        } catch (Exception e) {
            logger.error("Failed to update webhook stats for consumer {}: {}", consumerId, e.getMessage(), e);
        }
    }

    /**
     * Toplam consumer sayısını getirir
     */
    public long getTotalConsumerCount() {
        return webhookConsumerRepository.count();
    }
}
