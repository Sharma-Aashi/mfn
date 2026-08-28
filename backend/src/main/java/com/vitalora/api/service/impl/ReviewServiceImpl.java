package com.vitalora.api.service.impl;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.review.ReviewRequest;
import com.vitalora.api.dto.review.ReviewResponse;
import com.vitalora.api.dto.review.ReviewSummaryResponse;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.Review;
import com.vitalora.api.entity.User;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.ReviewMapper;
import com.vitalora.api.repository.ProductRepository;
import com.vitalora.api.repository.ReviewRepository;
import com.vitalora.api.repository.UserRepository;
import com.vitalora.api.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getApprovedForProduct(Long productId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.of(
                reviewRepository.findByProductIdAndStatus(productId, Review.ReviewStatus.APPROVED, pageable),
                ReviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummary(Long productId) {
        List<Review> approved = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(
                productId, Review.ReviewStatus.APPROVED);

        Map<Integer, Long> breakdown = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            breakdown.put(star, 0L);
        }
        approved.forEach(r -> breakdown.merge(r.getRating(), 1L, Long::sum));

        Double avg = reviewRepository.avgRatingForProduct(productId, Review.ReviewStatus.APPROVED);
        BigDecimal avgRating = avg != null
                ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new ReviewSummaryResponse(avgRating, approved.size(), breakdown);
    }

    @Override
    @Transactional
    public ReviewResponse submitReview(Long userId, Long productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new BadRequestException("You have already reviewed this product.");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .title(request.title())
                .comment(request.comment())
                .status(Review.ReviewStatus.PENDING)
                .build();

        return ReviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllForAdmin(String status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status == null || status.isBlank()) {
            return PageResponse.of(reviewRepository.findAll(pageable), ReviewMapper::toResponse);
        }
        Review.ReviewStatus reviewStatus = parseStatus(status);
        return PageResponse.of(reviewRepository.findByStatus(reviewStatus, pageable), ReviewMapper::toResponse);
    }

    @Override
    @Transactional
    public ReviewResponse approve(Long id) {
        Review review = findEntity(id);
        review.setStatus(Review.ReviewStatus.APPROVED);
        Review saved = reviewRepository.save(review);
        recomputeProductRating(review.getProduct().getId());
        return ReviewMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ReviewResponse reject(Long id) {
        Review review = findEntity(id);
        boolean wasApproved = review.getStatus() == Review.ReviewStatus.APPROVED;
        review.setStatus(Review.ReviewStatus.REJECTED);
        Review saved = reviewRepository.save(review);
        if (wasApproved) {
            recomputeProductRating(review.getProduct().getId());
        }
        return ReviewMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Review review = findEntity(id);
        Long productId = review.getProduct().getId();
        boolean wasApproved = review.getStatus() == Review.ReviewStatus.APPROVED;
        reviewRepository.delete(review);
        if (wasApproved) {
            recomputeProductRating(productId);
        }
    }

    @Override
    @Transactional
    public ReviewResponse setFeatured(Long id, boolean featured) {
        Review review = findEntity(id);
        review.setFeatured(featured);
        return ReviewMapper.toResponse(reviewRepository.save(review));
    }

    private void recomputeProductRating(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return;
        }
        long count = reviewRepository.countByProductIdAndStatus(productId, Review.ReviewStatus.APPROVED);
        Double avg = reviewRepository.avgRatingForProduct(productId, Review.ReviewStatus.APPROVED);
        product.setReviewCount((int) count);
        product.setAvgRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        productRepository.save(product);
    }

    private Review.ReviewStatus parseStatus(String status) {
        try {
            return Review.ReviewStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid review status: " + status);
        }
    }

    private Review findEntity(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Review", id));
    }
}
