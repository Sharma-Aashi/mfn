package com.vitalora.api.repository;

import com.vitalora.api.entity.Wishlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    // See CartRepository#findByUserId - fetching two bag-type collections at once
    // (items + product.images) trips Hibernate's MultipleBagFetchException.
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Wishlist> findByUserId(Long userId);
}
