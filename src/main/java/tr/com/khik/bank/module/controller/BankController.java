package tr.com.khik.bank.module.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;
import tr.com.khik.bank.module.dto.BulkTransferRequest;
import tr.com.khik.bank.module.dto.BulkTransferResponse;
import tr.com.khik.bank.module.dto.CreateAccountRequest;
import tr.com.khik.bank.module.dto.StatsResponse;
import tr.com.khik.bank.module.entity.Account;
import tr.com.khik.bank.module.entity.Transaction;
import tr.com.khik.bank.module.entity.WebhookLog;
import tr.com.khik.bank.module.service.BankService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/khik-bank")
@CrossOrigin(origins = "*")
public class BankController {

    private static final Logger logger = LoggerFactory.getLogger(BankController.class);

    @Autowired
    private BankService bankService;

    @PostMapping("/transfer")
    public ResponseEntity<BulkTransferResponse> transfer(@Valid @RequestBody BulkTransferRequest request) {
        logger.info("Bulk transfer request received with {} transfers", request.getTransfers().size());
        logger.debug("Transfer request details: {}", request);
        
        BulkTransferResponse response = bankService.bulkTransfer(request);
        
        logger.info("Bulk transfer completed - Total: {}, Successful: {}, Failed: {}", 
                   response.getTotalTransfers(), response.getSuccessfulTransfers(), response.getFailedTransfers());
        logger.debug("Transfer response: {}", response);
        
        return ResponseEntity.ok(response);
    }



    @PostMapping("/account/create")
    public ResponseEntity<?> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        logger.info("Create account request received - AccountId: {}, AccountName: {}", 
                   request.getAccountId(), request.getAccountName());
        
        try {
            Account account = bankService.createAccount(request);
            logger.info("Account created successfully - ID: {}, AccountId: {}, Name: {}", 
                       account.getId(), account.getAccountId(), account.getAccountName());
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            logger.error("Failed to create account - AccountId: {}, Error: {}", 
                        request.getAccountId(), e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getAccount(@PathVariable String accountId) {
        logger.info("Get account request received - AccountId: {}", accountId);
        
        try {
            Account account = bankService.getAccountByAccountIdAndActive(accountId);
            logger.info("Account retrieved successfully - ID: {}, Name: {}, Balance: {}", 
                       account.getId(), account.getAccountName(), account.getBalance());
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            logger.warn("Account not found - AccountId: {}, Error: {}", accountId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getAllAccounts() {
        logger.info("Get all accounts request received");
        
        try {
            List<Account> accounts = bankService.getAllActiveAccounts();
            logger.info("Retrieved {} active accounts", accounts.size());
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            logger.error("Failed to retrieve accounts - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/account/{accountId}")
    public ResponseEntity<?> deleteAccount(@PathVariable String accountId) {
        logger.info("Delete account request received - AccountId: {}", accountId);
        
        try {
            bankService.deleteAccount(accountId);
            logger.info("Account deleted successfully - AccountId: {}", accountId);
            return ResponseEntity.ok("Account deleted successfully: " + accountId);
        } catch (RuntimeException e) {
            logger.error("Failed to delete account - AccountId: {}, Error: {}", accountId, e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/account/transactions")
    public ResponseEntity<?> getAccountTransactions(@RequestParam String accountId) {
        logger.info("Get account transactions request received - AccountId: {}", accountId);
        
        try {
            List<Transaction> transactions = bankService.getAccountTransactions(accountId);
            logger.info("Retrieved {} transactions for account - AccountId: {}", transactions.size(), accountId);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            logger.error("Failed to retrieve transactions - AccountId: {}, Error: {}", accountId, e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        logger.debug("Health check request received");
        return ResponseEntity.ok("KHIK Bank Module is running!");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        logger.info("Get stats request received");
        
        try {
            long totalTransactions = bankService.getTotalTransactionCount();
            logger.info("Retrieved stats - Total transactions: {}", totalTransactions);
            return ResponseEntity.ok(new StatsResponse(totalTransactions));
        } catch (Exception e) {
            logger.error("Failed to retrieve stats - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/webhook-logs")
    public ResponseEntity<?> getWebhookLogs() {
        logger.info("Get webhook logs request received");
        
        try {
            List<WebhookLog> webhookLogs = bankService.getAllWebhookLogs();
            logger.info("Retrieved {} webhook logs", webhookLogs.size());
            return ResponseEntity.ok(webhookLogs);
        } catch (Exception e) {
            logger.error("Failed to retrieve webhook logs - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/transactions/by-tc")
    public ResponseEntity<?> getTransactionsByTc() {
        logger.info("Get transactions by TC request received");
        
        try {
            Map<String, Object> result = bankService.getTransactionsGroupedByTc();
            logger.info("Retrieved transactions grouped by TC - {} TC IDs found", 
                       result.get("tcTransactions") != null ? ((Map<?, ?>) result.get("tcTransactions")).size() : 0);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to retrieve transactions by TC - Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logger.warn("Validation failed for request - {} validation errors", ex.getBindingResult().getErrorCount());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
            logger.warn("Validation error - Field: {}, Error: {}", fieldName, errorMessage);
        });
        
        logger.error("Request validation failed - Errors: {}", errors);
        return ResponseEntity.badRequest().body(errors);
    }
}
