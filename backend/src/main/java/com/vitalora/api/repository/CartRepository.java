package com.vitalora.api.repository;

import com.vitalora.api.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // Product.images is also a List (bag); fetching it alongside items here would trip
    // Hibernate's MultipleBagFetchException. Product images lazy-load per item instead -
    // an acceptable N+1 given carts are small.
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Cart> findByUserId(Long userId);
}
