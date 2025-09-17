package tr.com.khik.bank.module.dto;

import java.math.BigDecimal;
import java.util.List;

public class BulkTransferResponse {

    private List<AccountInfo> bankAccounts;
    private int totalTransfers;
    private int successfulTransfers;
    private int failedTransfers;

    public BulkTransferResponse() {}

    public BulkTransferResponse(List<AccountInfo> bankAccounts) {
        this.bankAccounts = bankAccounts;
        this.totalTransfers = bankAccounts != null ? bankAccounts.size() : 0;
        this.successfulTransfers = 0;
        this.failedTransfers = 0;
    }

    public BulkTransferResponse(List<AccountInfo> bankAccounts, int totalTransfers, int successfulTransfers, int failedTransfers) {
        this.bankAccounts = bankAccounts;
        this.totalTransfers = totalTransfers;
        this.successfulTransfers = successfulTransfers;
        this.failedTransfers = failedTransfers;
    }

    public List<AccountInfo> getBankAccounts() {
        return bankAccounts;
    }

    public void setBankAccounts(List<AccountInfo> bankAccounts) {
        this.bankAccounts = bankAccounts;
    }

    public int getTotalTransfers() {
        return totalTransfers;
    }

    public void setTotalTransfers(int totalTransfers) {
        this.totalTransfers = totalTransfers;
    }

    public int getSuccessfulTransfers() {
        return successfulTransfers;
    }

    public void setSuccessfulTransfers(int successfulTransfers) {
        this.successfulTransfers = successfulTransfers;
    }

    public int getFailedTransfers() {
        return failedTransfers;
    }

    public void setFailedTransfers(int failedTransfers) {
        this.failedTransfers = failedTransfers;
    }



    // Inner class for account information
    public static class AccountInfo {
        private String accountId;
        private String accountName;
        private BigDecimal balance;
        private String currency;
        private boolean isActive;

        public AccountInfo() {}

        public AccountInfo(String accountId, String accountName, BigDecimal balance, String currency, boolean isActive) {
            this.accountId = accountId;
            this.accountName = accountName;
            this.balance = balance;
            this.currency = currency;
            this.isActive = isActive;
        }

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

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(BigDecimal balance) {
            this.balance = balance;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public boolean isActive() {
            return isActive;
        }

        public void setActive(boolean active) {
            isActive = active;
        }
    }
}
