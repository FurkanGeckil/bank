package tr.com.khik.bank.module.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.com.khik.bank.module.entity.BankSettings;

import java.util.Optional;

@Repository
public interface BankSettingsRepository extends JpaRepository<BankSettings, Long> {

    Optional<BankSettings> findFirstByOrderByIdAsc();

    Optional<BankSettings> findByBankIban(String bankIban);
}
