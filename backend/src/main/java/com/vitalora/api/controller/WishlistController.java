package com.vitalora.api.controller;

import com.vitalora.api.dto.wishlist.WishlistResponse;
import com.vitalora.api.security.SecurityUserDetails;
import com.vitalora.api.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<WishlistResponse> getWishlist(@AuthenticationPrincipal SecurityUserDetails principal) {
        return ResponseEntity.ok(wishlistService.getWishlist(principal.getId()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistResponse> addItem(@AuthenticationPrincipal SecurityUserDetails principal,
                                                       @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addItem(principal.getId(), productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<WishlistResponse> removeItem(@AuthenticationPrincipal SecurityUserDetails principal,
                                                          @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.removeItem(principal.getId(), productId));
    }
}
