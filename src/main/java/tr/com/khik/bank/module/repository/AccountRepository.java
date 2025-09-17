package tr.com.khik.bank.module.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.com.khik.bank.module.entity.Account;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    Optional<Account> findByAccountId(String accountId);
    
    Optional<Account> findByAccountIdAndIsActiveTrue(String accountId);
    
    List<Account> findByIsActiveTrue();
    
    boolean existsByAccountId(String accountId);
}
