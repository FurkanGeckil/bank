package tr.com.khik.bank.module.dto;

public class StatsResponse {
    private long totalTransactions;

    public StatsResponse() {}

    public StatsResponse(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }
}
