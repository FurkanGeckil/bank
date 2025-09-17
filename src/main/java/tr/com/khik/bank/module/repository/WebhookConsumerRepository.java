package tr.com.khik.bank.module.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tr.com.khik.bank.module.entity.WebhookConsumer;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebhookConsumerRepository extends JpaRepository<WebhookConsumer, Long> {

    /**
     * Tüm webhook consumer'ları getirir
     */
    List<WebhookConsumer> findAll();

    /**
     * Belirli bir callback URL'e sahip consumer'ı bulur
     */
    Optional<WebhookConsumer> findByCallbackUrl(String callbackUrl);

    /**
     * Belirli bir isme sahip consumer'ı bulur
     */
    Optional<WebhookConsumer> findByConsumerName(String consumerName);


    /**
     * En çok webhook gönderilen consumer'ları getirir
     */
    @Query("SELECT wc FROM WebhookConsumer wc ORDER BY wc.webhookCount DESC")
    List<WebhookConsumer> findConsumersOrderByWebhookCountDesc();

    /**
     * En son webhook gönderilen consumer'ları getirir
     */
    @Query("SELECT wc FROM WebhookConsumer wc WHERE wc.lastWebhookSent IS NOT NULL ORDER BY wc.lastWebhookSent DESC")
    List<WebhookConsumer> findConsumersOrderByLastWebhookSentDesc();

    /**
     * Başarı oranı en yüksek consumer'ları getirir
     */
    @Query("SELECT wc FROM WebhookConsumer wc WHERE wc.webhookCount > 0 ORDER BY (wc.successfulWebhookCount * 100.0 / wc.webhookCount) DESC")
    List<WebhookConsumer> findConsumersOrderBySuccessRateDesc();

    /**
     * Belirli bir tarihten sonra oluşturulan consumer'ları getirir
     */
    List<WebhookConsumer> findByCreatedAtAfter(java.time.LocalDateTime dateTime);
}
