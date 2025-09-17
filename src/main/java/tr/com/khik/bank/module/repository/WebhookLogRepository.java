package tr.com.khik.bank.module.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.com.khik.bank.module.entity.WebhookLog;

import java.util.List;

@Repository
public interface WebhookLogRepository extends JpaRepository<WebhookLog, Long> {

    List<WebhookLog> findAllByOrderByCreatedAtDesc();

    List<WebhookLog> findByStatusOrderByCreatedAtDesc(String status);

    List<WebhookLog> findByTransactionIdOrderByCreatedAtDesc(String transactionId);
}
