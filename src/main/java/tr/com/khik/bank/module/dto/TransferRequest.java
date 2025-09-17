package tr.com.khik.bank.module.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public class TransferRequest {

    @NotBlank(message = "Bank account ID (IBAN) cannot be empty")
    @Pattern(regexp = "^TR[0-9]{24}$", 
             message = "Please enter a valid IBAN number (26 characters: TR + 24 digits)")
    private String bankAccountId; // IBAN number

    private String bankAccountName; // Optional - if empty, will be auto-generated

    @NotNull(message = "Amount cannot be empty")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0.01")
    private BigDecimal amount;

    private String description;

    @NotBlank(message = "TC Identity Number cannot be empty")
    @Pattern(regexp = "^[0-9]{11}$", message = "TC Identity Number must be 11 digits")
    private String tcId;

    public TransferRequest() {}

    public TransferRequest(String bankAccountId, String bankAccountName, BigDecimal amount, String description, String tcId) {
        this.bankAccountId = bankAccountId;
        this.bankAccountName = bankAccountName;
        this.amount = amount;
        this.description = description;
        this.tcId = tcId;
    }

    // Getter ve Setter metodları
    public String getBankAccountId() {
        return bankAccountId;
    }

    public void setBankAccountId(String bankAccountId) {
        this.bankAccountId = bankAccountId;
    }

    public String getBankAccountName() {
        return bankAccountName;
    }

    public void setBankAccountName(String bankAccountName) {
        this.bankAccountName = bankAccountName;
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
}
