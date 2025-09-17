package tr.com.khik.bank.module.dto;

import java.time.LocalDateTime;

public class WebhookRegisterResponse {

    private Long consumerId;
    private String consumerName;
    private String callbackUrl;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String status;
    private String message;

    public WebhookRegisterResponse() {}

    public WebhookRegisterResponse(Long consumerId, String consumerName, String callbackUrl, 
                                 String description, Boolean isActive, LocalDateTime createdAt, 
                                 String status, String message) {
        this.consumerId = consumerId;
        this.consumerName = consumerName;
        this.callbackUrl = callbackUrl;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.status = status;
        this.message = message;
    }

    // Getters and Setters
    public Long getConsumerId() {
        return consumerId;
    }

    public void setConsumerId(Long consumerId) {
        this.consumerId = consumerId;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "WebhookRegisterResponse{" +
                "consumerId=" + consumerId +
                ", consumerName='" + consumerName + '\'' +
                ", callbackUrl='" + callbackUrl + '\'' +
                ", description='" + description + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", status='" + status + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}
