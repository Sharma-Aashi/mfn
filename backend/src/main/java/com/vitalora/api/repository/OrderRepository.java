package com.vitalora.api.repository;

import com.vitalora.api.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    @EntityGraph(attributePaths = {"items", "payment"})
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "payment"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"items", "payment"})
    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);

    /**
     * Admin fetch — no user scoping. The entity graph pulls items and payment
     * eagerly so the detail page renders in one query, matching how the
     * customer-scoped lookups above work.
     */
    @EntityGraph(attributePaths = {"items", "payment"})
    @Override
    Optional<Order> findById(Long id);

    boolean existsByOrderNumber(String orderNumber);
}
