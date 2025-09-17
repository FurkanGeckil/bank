package tr.com.khik.bank.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_consumers")
public class WebhookConsumer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consumer_name", nullable = false)
    @NotBlank(message = "Consumer name cannot be empty")
    private String consumerName;

    @Column(name = "callback_url", nullable = false)
    @NotBlank(message = "Callback URL cannot be empty")
    @Pattern(regexp = "^https?://.*", message = "Callback URL must be a valid HTTP/HTTPS URL")
    private String callbackUrl;

    @Column(name = "description")
    private String description;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_webhook_sent")
    private LocalDateTime lastWebhookSent;

    @Column(name = "webhook_count", nullable = false)
    private Long webhookCount = 0L;

    @Column(name = "successful_webhook_count", nullable = false)
    private Long successfulWebhookCount = 0L;

    @Column(name = "failed_webhook_count", nullable = false)
    private Long failedWebhookCount = 0L;

    public WebhookConsumer() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public WebhookConsumer(String consumerName, String callbackUrl, String description) {
        this();
        this.consumerName = consumerName;
        this.callbackUrl = callbackUrl;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConsumerName() {
        return consumerName;
    }

    public void setConsumerName(String consumerName) {
        this.consumerName = consumerName;
    }

    public String getCallbackUrl() {
        return callbackUrl;
    }

    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getLastWebhookSent() {
        return lastWebhookSent;
    }

    public void setLastWebhookSent(LocalDateTime lastWebhookSent) {
        this.lastWebhookSent = lastWebhookSent;
    }

    public Long getWebhookCount() {
        return webhookCount;
    }

    public void setWebhookCount(Long webhookCount) {
        this.webhookCount = webhookCount;
    }

    public Long getSuccessfulWebhookCount() {
        return successfulWebhookCount;
    }

    public void setSuccessfulWebhookCount(Long successfulWebhookCount) {
        this.successfulWebhookCount = successfulWebhookCount;
    }

    public Long getFailedWebhookCount() {
        return failedWebhookCount;
    }

    public void setFailedWebhookCount(Long failedWebhookCount) {
        this.failedWebhookCount = failedWebhookCount;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
