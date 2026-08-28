package com.vitalora.api.mapper;

import com.vitalora.api.dto.review.ReviewResponse;
import com.vitalora.api.entity.Review;

public final class ReviewMapper {

    private ReviewMapper() {
    }

    public static ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getProduct().getSlug(),
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.getStatus().name(),
                review.isFeatured(),
                review.getCreatedAt()
        );
    }
}
