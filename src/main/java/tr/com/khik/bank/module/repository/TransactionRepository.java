package tr.com.khik.bank.module.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.com.khik.bank.module.entity.Transaction;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByToAccountAccountIdOrderByTransactionDateDesc(String accountId);
    
    List<Transaction> findAllByOrderByTransactionDateDesc();
}
