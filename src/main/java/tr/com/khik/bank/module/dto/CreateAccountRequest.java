package tr.com.khik.bank.module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CreateAccountRequest {

    @NotBlank(message = "Account ID (IBAN) cannot be empty")
    @Pattern(regexp = "^TR[0-9]{24}$", 
             message = "Please enter a valid IBAN number (26 characters: TR + 24 digits)")
    private String accountId; // IBAN number

    @NotBlank(message = "Account name cannot be empty")
    private String accountName;

    public CreateAccountRequest() {}

    public CreateAccountRequest(String accountId, String accountName) {
        this.accountId = accountId;
        this.accountName = accountName;
    }

    // Getter ve Setter metodları
    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }
}
