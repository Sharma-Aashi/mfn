package com.vitalora.api.repository;

import com.vitalora.api.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    // A line points at a variant now, and the variant carries the price, the stock
    // and the product. Product.images is also a List (bag); fetching it alongside
    // items here would trip Hibernate's MultipleBagFetchException, so images
    // lazy-load per line - an acceptable N+1 given carts are small.
    @EntityGraph(attributePaths = {
            "items", "items.variant", "items.variant.product", "items.variant.product.brand", "items.variant.inventory"})
    Optional<Cart> findByUserId(Long userId);
}
