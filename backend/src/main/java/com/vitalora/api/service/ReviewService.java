package com.vitalora.api.service;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.review.ReviewRequest;
import com.vitalora.api.dto.review.ReviewResponse;
import com.vitalora.api.dto.review.ReviewSummaryResponse;

public interface ReviewService {
    PageResponse<ReviewResponse> getApprovedForProduct(Long productId, int page, int size);

    ReviewSummaryResponse getSummary(Long productId);

    ReviewResponse submitReview(Long userId, Long productId, ReviewRequest request);

    PageResponse<ReviewResponse> getAllForAdmin(String status, int page, int size);

    ReviewResponse approve(Long id);

    ReviewResponse reject(Long id);

    void delete(Long id);

    ReviewResponse setFeatured(Long id, boolean featured);
}
