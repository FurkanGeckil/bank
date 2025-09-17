package tr.com.khik.bank.module.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransferResponse {

    private String transactionId;
    private String toAccountId;
    private BigDecimal amount;
    private String description;
    private String tcId;
    private LocalDateTime transactionDate;
    private String status;
    private String message;

    public TransferResponse() {}

    public TransferResponse(String transactionId, String toAccountId, 
                           BigDecimal amount, String description, String tcId, 
                           LocalDateTime transactionDate, String status, String message) {
        this.transactionId = transactionId;
        this.toAccountId = toAccountId;
        this.amount = amount;
        this.description = description;
        this.tcId = tcId;
        this.transactionDate = transactionDate;
        this.status = status;
        this.message = message;
    }

    // Getter ve Setter metodları
    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }



    public String getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(String toAccountId) {
        this.toAccountId = toAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTcId() {
        return tcId;
    }

    public void setTcId(String tcId) {
        this.tcId = tcId;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
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
}
