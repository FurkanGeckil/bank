package tr.com.khik.bank.module.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_logs")
public class WebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tc_id", nullable = false)
    private String tcId;

    @Column(name = "amount", nullable = false)
    private String amount;

    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "description")
    private String description;

    @Column(name = "webhook_url", nullable = false)
    private String webhookUrl;

    @Column(name = "status", nullable = false)
    private String status; // SUCCESS, FAILED

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public WebhookLog() {
        this.createdAt = LocalDateTime.now();
    }

    public WebhookLog(String tcId, String amount, String transactionId, String source,
                     String description, String webhookUrl, String status) {
        this.tcId = tcId;
        this.amount = amount;
        this.transactionId = transactionId;
        this.source = source;
        this.description = description;
        this.webhookUrl = webhookUrl;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTcId() { return tcId; }
    public void setTcId(String tcId) { this.tcId = tcId; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
