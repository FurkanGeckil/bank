package tr.com.khik.bank.module.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.com.khik.bank.module.dto.BulkTransferRequest;
import tr.com.khik.bank.module.dto.BulkTransferResponse;
import tr.com.khik.bank.module.dto.CreateAccountRequest;
import tr.com.khik.bank.module.dto.TransferRequest;
import tr.com.khik.bank.module.dto.TransferResponse;
import tr.com.khik.bank.module.dto.WebhookRequest;
import tr.com.khik.bank.module.entity.Account;
import tr.com.khik.bank.module.entity.Transaction;
import tr.com.khik.bank.module.entity.WebhookLog;
import tr.com.khik.bank.module.enums.TransferSource;
import tr.com.khik.bank.module.repository.AccountRepository;
import tr.com.khik.bank.module.repository.TransactionRepository;
import tr.com.khik.bank.module.repository.WebhookLogRepository;
import tr.com.khik.bank.module.service.WebhookService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@SuppressWarnings("unused")
@Service
public class BankService {

    private static final Logger logger = LoggerFactory.getLogger(BankService.class);

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WebhookLogRepository webhookLogRepository;

    @Autowired
    private BankSettingsService bankSettingsService;

    @Autowired
    private WebhookService webhookService;

    // Bank'ın kendi hesabı (dinamik IBAN)
    private String getBankAccountId() {
        return bankSettingsService.getBankIban();
    }

    @Transactional
    public TransferResponse transfer(TransferRequest request) {
        try {
            logger.info("Starting transfer for account: {}", request.getBankAccountId());
            
            // Check if the target account exists in the system, if not create it
            Account targetAccount = accountRepository.findByAccountId(request.getBankAccountId())
                    .orElseGet(() -> {
                        // Hesap yoksa otomatik olarak yarat
                        logger.info("Account not found, creating new account: {}", request.getBankAccountId());
                        String accountName = request.getBankAccountName() != null && !request.getBankAccountName().trim().isEmpty() 
                            ? request.getBankAccountName() 
                            : "Auto-Created Account";
                        Account newAccount = new Account(request.getBankAccountId(), accountName, BigDecimal.ZERO);
                        newAccount.setIsActive(true);
                        Account savedAccount = accountRepository.save(newAccount);
                        logger.info("New account created: {}, Name: {}, Active: {}", savedAccount.getAccountId(), savedAccount.getAccountName(), savedAccount.getIsActive());
                        return savedAccount;
                    });
            
            // Eğer hesap aktif değilse aktif yap
            if (!targetAccount.getIsActive()) {
                logger.info("Account is inactive, activating: {}", targetAccount.getAccountId());
                targetAccount.setIsActive(true);
                targetAccount = accountRepository.save(targetAccount);
            }
            
            logger.info("Target account found/created: {}, Balance: {}", targetAccount.getAccountId(), targetAccount.getBalance());
            
            
            // Transfer işlemini gerçekleştir
            // Sadece hedef hesaba para girişi (pozitif)
            targetAccount.setBalance(targetAccount.getBalance().add(request.getAmount()));
            accountRepository.save(targetAccount);
            
            logger.info("Balance updated: {}", targetAccount.getBalance());
            
            // İşlem kaydını oluştur
            Transaction transaction = new Transaction(
                request.getBankAccountId(), // to (müşteri hesabı)
                request.getAmount(),
                request.getDescription(),
                request.getTcId()
            );
            
            // Set the toAccount relationship
            transaction.setToAccount(targetAccount);
            
            Transaction savedTransaction = transactionRepository.save(transaction);
            
            logger.info("Transaction saved with ID: {}", savedTransaction.getId());
            
            return new TransferResponse(
                savedTransaction.getId().toString(),
                request.getBankAccountId(),
                request.getAmount(),
                request.getDescription(),
                request.getTcId(),
                savedTransaction.getTransactionDate(),
                "SUCCESS",
                "Transfer completed successfully"
            );
            
        } catch (Exception e) {
            logger.error("Error in transfer method: {}", e.getMessage(), e);
            e.printStackTrace();
            return new TransferResponse(
                null,
                request.getBankAccountId(),
                request.getAmount(),
                request.getDescription(),
                request.getTcId(),
                LocalDateTime.now(),
                "FAILED",
                "Transfer failed: " + e.getMessage()
            );
        }
    }

    @Transactional
    public BulkTransferResponse bulkTransfer(BulkTransferRequest request) {
        try {
            List<BulkTransferResponse.AccountInfo> bankAccounts = new ArrayList<>();
            
            // Önce tüm transfer request'lerdeki bankAccountId'leri topla
            Set<String> allBankAccountIds = new HashSet<>();
            for (TransferRequest transferRequest : request.getTransfers()) {
                allBankAccountIds.add(transferRequest.getBankAccountId());
            }
            
            // Transfer işlemlerini gerçekleştir
            for (TransferRequest transferRequest : request.getTransfers()) {
                TransferResponse response = transfer(transferRequest);
                
                // Webhook çağrısı yap
                if (response.getStatus().equals("SUCCESS")) {
                    try {
                        WebhookRequest webhookRequest = new WebhookRequest(
                            transferRequest.getTcId(),
                            transferRequest.getAmount(),
                            response.getTransactionId(),
                            TransferSource.BANK_TRANSFER,
                            transferRequest.getDescription()
                        );
                        
                        logger.info("=== WEBHOOK CALL FOR TRANSFER ===");
                        logger.info("Transaction ID: {}", response.getTransactionId());
                        logger.info("TC ID: {}", transferRequest.getTcId());
                        logger.info("Amount: {}", transferRequest.getAmount());
                        
                        webhookService.sendTransferWebhook(webhookRequest);
                        
                    } catch (Exception e) {
                        logger.error("Webhook call failed for transfer: {}", e.getMessage(), e);
                    }
                }
            }
            
            // Transfer işlemleri tamamlandıktan sonra tüm etkilenen hesapların güncel bilgilerini al
            logger.info("Getting account details for: {}", allBankAccountIds);
            for (String accountId : allBankAccountIds) {
                try {
                    logger.info("Getting details for account: {}", accountId);
                    Account account = accountRepository.findByAccountId(accountId)
                            .orElseGet(() -> {
                                logger.info("Account not found in bulkTransfer, creating new account: {}", accountId);
                                Account newAccount = new Account(accountId, "Auto-Created Account", BigDecimal.ZERO);
                                newAccount.setIsActive(true);
                                return accountRepository.save(newAccount);
                            });
                    logger.info("Account found: {}, Balance: {}", account.getAccountId(), account.getBalance());
                    
                    BulkTransferResponse.AccountInfo accountInfo = new BulkTransferResponse.AccountInfo(
                        account.getAccountId(),
                        account.getAccountName(),
                        account.getBalance(),
                        account.getCurrency(),
                        account.getIsActive()
                    );

                    // Check if account already exists in the list
                    boolean exists = bankAccounts.stream()
                        .anyMatch(acc -> acc.getAccountId().equals(accountInfo.getAccountId()));
                    if (!exists) {
                        bankAccounts.add(accountInfo);
                        logger.info("Account added to response: {}", accountInfo.getAccountId());
                    }

                } catch (Exception e) {
                    // Log error but continue with other accounts
                    logger.error("Error getting account details for {}: {}", accountId, e.getMessage(), e);
                    e.printStackTrace();
                }
            }

            return new BulkTransferResponse(bankAccounts);
        } catch (Exception e) {
            logger.error("Error in bulkTransfer: {}", e.getMessage(), e);
            e.printStackTrace();
            return new BulkTransferResponse(new ArrayList<>());
        }
    }


    public Account getAccountByAccountId(String accountId) {
        return accountRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    // Hesap yoksa otomatik olarak yarat
                    logger.info("Account not found in getAccountByAccountId, creating new account: {}", accountId);
                    Account newAccount = new Account(accountId, "Auto-Created Account", BigDecimal.ZERO);
                    newAccount.setIsActive(true);
                    Account savedAccount = accountRepository.save(newAccount);
                    logger.info("New account created in getAccountByAccountId: {}, Active: {}", savedAccount.getAccountId(), savedAccount.getIsActive());
                    return savedAccount;
                });
    }

    @Transactional
    public Account createAccount(CreateAccountRequest request) {
        // Check if account already exists
        if (accountRepository.existsByAccountId(request.getAccountId())) {
            throw new RuntimeException("Account with IBAN " + request.getAccountId() + " already exists");
        }
        
        // Create new account with zero balance
        Account account = new Account(request.getAccountId(), request.getAccountName());
        return accountRepository.save(account);
    }

    public Account getAccountByAccountIdAndActive(String accountId) {
        return accountRepository.findByAccountIdAndIsActiveTrue(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Account> getAllActiveAccounts() {
        return accountRepository.findByIsActiveTrue();
    }

    @Transactional
    public void deleteAccount(String accountId) {
        // Bank hesabının silinmesini engelle
        if (getBankAccountId().equals(accountId)) {
            throw new RuntimeException("Cannot delete XXX Bank account");
        }
        
        // Hesabı bul
        Account account = getAccountByAccountId(accountId);
        
        // Hesabın aktif olup olmadığını kontrol et
        if (!account.getIsActive()) {
            throw new RuntimeException("Account is already inactive: " + accountId);
        }
        
        
        // Hesaba ait tüm transactionları sil
        List<Transaction> accountTransactions = transactionRepository.findByToAccountAccountIdOrderByTransactionDateDesc(accountId);
        transactionRepository.deleteAll(accountTransactions);
        
        // Hesabı sil
        accountRepository.delete(account);
    }

    public List<Transaction> getAccountTransactions(String accountId) {
        // Hesabın var olup olmadığını kontrol et
        Account account = getAccountByAccountId(accountId);
        
        // Hesabın transaction'larını getir (en güncelden en eskiye sıralı)
        return transactionRepository.findByToAccountAccountIdOrderByTransactionDateDesc(accountId);
    }

    public long getTotalTransactionCount() {
        return transactionRepository.count();
    }

    public List<WebhookLog> getAllWebhookLogs() {
        return webhookLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getTransactionsGroupedByTc() {
        List<Transaction> allTransactions = transactionRepository.findAllByOrderByTransactionDateDesc();
        
        Map<String, BigDecimal> tcTotalAmounts = new HashMap<>();
        Map<String, List<Transaction>> tcTransactions = new HashMap<>();
        
        for (Transaction transaction : allTransactions) {
            String tcId = transaction.getTcId();
            
            // TC ID bazında toplam miktarı hesapla
            tcTotalAmounts.merge(tcId, transaction.getAmount(), BigDecimal::add);
            
            // TC ID bazında transaction listesini oluştur
            tcTransactions.computeIfAbsent(tcId, k -> new ArrayList<>()).add(transaction);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("tcTotalAmounts", tcTotalAmounts);
        result.put("tcTransactions", tcTransactions);
        result.put("totalTcCount", tcTotalAmounts.size());
        
        return result;
    }
}
