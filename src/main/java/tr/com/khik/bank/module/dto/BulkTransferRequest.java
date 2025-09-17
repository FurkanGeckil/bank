package tr.com.khik.bank.module.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BulkTransferRequest {

    @NotEmpty(message = "Transfer list cannot be empty")
    @Size(max = 100, message = "Maximum 100 transfers allowed per request")
    @Valid
    private List<TransferRequest> transfers;

    public BulkTransferRequest() {}

    public BulkTransferRequest(List<TransferRequest> transfers) {
        this.transfers = transfers;
    }

    public List<TransferRequest> getTransfers() {
        return transfers;
    }

    public void setTransfers(List<TransferRequest> transfers) {
        this.transfers = transfers;
    }
}
