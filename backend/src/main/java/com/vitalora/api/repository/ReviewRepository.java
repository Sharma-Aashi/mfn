package com.vitalora.api.repository;

import com.vitalora.api.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndStatus(Long productId, Review.ReviewStatus status, Pageable pageable);
    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, Review.ReviewStatus status);
    Page<Review> findByStatus(Review.ReviewStatus status, Pageable pageable);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
    long countByProductIdAndStatus(Long productId, Review.ReviewStatus status);

    @Query("select avg(r.rating) from Review r where r.product.id = :productId and r.status = :status")
    Double avgRatingForProduct(@Param("productId") Long productId, @Param("status") Review.ReviewStatus status);
}
