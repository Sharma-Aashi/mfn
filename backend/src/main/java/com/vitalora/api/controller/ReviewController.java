package com.vitalora.api.controller;

import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.common.StatusUpdateRequest;
import com.vitalora.api.dto.review.ReviewRequest;
import com.vitalora.api.dto.review.ReviewResponse;
import com.vitalora.api.dto.review.ReviewSummaryResponse;
import com.vitalora.api.security.SecurityUserDetails;
import com.vitalora.api.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/products/{productId}/reviews")
    public ResponseEntity<PageResponse<ReviewResponse>> getForProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getApprovedForProduct(productId, page, size));
    }

    @GetMapping("/api/products/{productId}/reviews/summary")
    public ResponseEntity<ReviewSummaryResponse> getSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getSummary(productId));
    }

    @PostMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ReviewResponse> submit(@PathVariable Long productId,
                                                   @AuthenticationPrincipal SecurityUserDetails principal,
                                                   @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.submitReview(principal.getId(), productId, request));
    }

    @GetMapping("/api/admin/reviews")
    public ResponseEntity<PageResponse<ReviewResponse>> getAllForAdmin(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(reviewService.getAllForAdmin(status, page, size));
    }

    @PatchMapping("/api/admin/reviews/{id}/approve")
    public ResponseEntity<ReviewResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.approve(id));
    }

    @PatchMapping("/api/admin/reviews/{id}/reject")
    public ResponseEntity<ReviewResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.reject(id));
    }

    @PatchMapping("/api/admin/reviews/{id}/featured")
    public ResponseEntity<ReviewResponse> setFeatured(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(reviewService.setFeatured(id, request.active()));
    }

    @DeleteMapping("/api/admin/reviews/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Review deleted."));
    }
}
