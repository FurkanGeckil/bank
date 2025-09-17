package tr.com.khik.bank.module.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tr.com.khik.bank.module.dto.BankSettingsRequest;
import tr.com.khik.bank.module.entity.BankSettings;
import tr.com.khik.bank.module.repository.BankSettingsRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class BankSettingsService {

    @Autowired
    private BankSettingsRepository bankSettingsRepository;

    @Value("${bank.default.iban:TR330006100519786457841326}")
    private String defaultBankIban;

    @Value("${bank.default.name:XXX Bank}")
    private String defaultBankName;

    public BankSettings getBankSettings() {
        Optional<BankSettings> existingSettings = bankSettingsRepository.findFirstByOrderByIdAsc();
        
        if (existingSettings.isPresent()) {
            return existingSettings.get();
        } else {
            // Varsayılan ayarları oluştur
            return createDefaultBankSettings();
        }
    }

    public BankSettings createOrUpdateBankSettings(BankSettingsRequest request) {
        Optional<BankSettings> existingSettings = bankSettingsRepository.findFirstByOrderByIdAsc();
        
        BankSettings bankSettings;
        if (existingSettings.isPresent()) {
            bankSettings = existingSettings.get();
            bankSettings.setBankIban(request.getBankIban());
            bankSettings.setBankName(request.getBankName());
            bankSettings.setUpdatedAt(LocalDateTime.now());
        } else {
            bankSettings = new BankSettings(request.getBankIban(), request.getBankName());
        }
        
        return bankSettingsRepository.save(bankSettings);
    }

    private BankSettings createDefaultBankSettings() {
        BankSettings defaultSettings = new BankSettings(defaultBankIban, defaultBankName);
        return bankSettingsRepository.save(defaultSettings);
    }

    public String getBankIban() {
        return getBankSettings().getBankIban();
    }

    public String getBankName() {
        return getBankSettings().getBankName();
    }

    public void resetBankSettings() {
        bankSettingsRepository.deleteAll();
    }
}
