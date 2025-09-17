package tr.com.khik.bank.module.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tr.com.khik.bank.module.enums.TransferSource;
import tr.com.khik.bank.module.validation.ValidTcKimlikNo;
import java.math.BigDecimal;

public class WebhookRequest {
    
    @NotBlank(message = "TC ID is required")
    @ValidTcKimlikNo
    private String tcId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Transaction ID is required")
    private String transactionId;
    
    @NotNull(message = "Source is required")
    private TransferSource source;
    
    private String description;
    
    private String metadata;

    public WebhookRequest() {}

    public WebhookRequest(String tcId, BigDecimal amount, String transactionId, 
                         TransferSource source, String description) {
        this.tcId = tcId;
        this.amount = amount;
        this.transactionId = transactionId;
        this.source = source;
        this.description = description;
    }

    // Getters and Setters
    public String getTcId() {
        return tcId;
    }

    public void setTcId(String tcId) {
        this.tcId = tcId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public TransferSource getSource() {
        return source;
    }

    public void setSource(TransferSource source) {
        this.source = source;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    @Override
    public String toString() {
        return "WebhookRequest{" +
                "tcId='" + tcId + '\'' +
                ", amount=" + amount +
                ", transactionId='" + transactionId + '\'' +
                ", source=" + source +
                ", description='" + description + '\'' +
                ", metadata='" + metadata + '\'' +
                '}';
    }
}
