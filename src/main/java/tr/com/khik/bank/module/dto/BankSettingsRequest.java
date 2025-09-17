package tr.com.khik.bank.module.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class BankSettingsRequest {

    @NotBlank(message = "Banka IBAN alanı boş olamaz")
    @Pattern(regexp = "^TR[0-9]{24}$", message = "Geçerli bir IBAN numarası giriniz (TR + 24 rakam)")
    private String bankIban;

    @NotBlank(message = "Banka adı alanı boş olamaz")
    private String bankName;

    public BankSettingsRequest() {}

    public BankSettingsRequest(String bankIban, String bankName) {
        this.bankIban = bankIban;
        this.bankName = bankName;
    }

    // Getters and Setters
    public String getBankIban() {
        return bankIban;
    }

    public void setBankIban(String bankIban) {
        this.bankIban = bankIban;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
}
