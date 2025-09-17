package tr.com.khik.bank.module.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tr.com.khik.bank.module.dto.BankSettingsRequest;
import tr.com.khik.bank.module.entity.BankSettings;
import tr.com.khik.bank.module.service.BankSettingsService;

@RestController
@RequestMapping("/khik-bank")
@CrossOrigin(origins = "*")
public class BankSettingsController {

    private static final Logger logger = LoggerFactory.getLogger(BankSettingsController.class);

    @Autowired
    private BankSettingsService bankSettingsService;

    @GetMapping("/settings")
    public ResponseEntity<BankSettings> getBankSettings() {
        logger.info("Get bank settings request received");
        
        try {
            BankSettings settings = bankSettingsService.getBankSettings();
            logger.info("Bank settings retrieved successfully - BankName: {}, BankIban: {}", 
                       settings.getBankName(), settings.getBankIban());
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            logger.error("Failed to retrieve bank settings - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/settings")
    public ResponseEntity<?> createOrUpdateBankSettings(@Valid @RequestBody BankSettingsRequest request) {
        logger.info("Create/Update bank settings request received - BankName: {}, BankIban: {}", 
                   request.getBankName(), request.getBankIban());
        
        try {
            BankSettings settings = bankSettingsService.createOrUpdateBankSettings(request);
            logger.info("Bank settings created/updated successfully - ID: {}, BankName: {}, BankIban: {}", 
                       settings.getId(), settings.getBankName(), settings.getBankIban());
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            logger.error("Failed to create/update bank settings - Error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/settings")
    public ResponseEntity<?> resetBankSettings() {
        logger.info("Reset bank settings request received");
        
        try {
            bankSettingsService.resetBankSettings();
            logger.info("Bank settings reset successfully");
            return ResponseEntity.ok("Bank settings reset successfully");
        } catch (Exception e) {
            logger.error("Failed to reset bank settings - Error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
