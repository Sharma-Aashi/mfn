package com.vitalora.api.controller;

import com.vitalora.api.dto.cart.*;
import com.vitalora.api.security.SecurityUserDetails;
import com.vitalora.api.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal SecurityUserDetails principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal SecurityUserDetails principal,
                                                  @Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(principal.getId(), request));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CartResponse> updateItem(@AuthenticationPrincipal SecurityUserDetails principal,
                                                     @PathVariable Long itemId,
                                                     @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItem(principal.getId(), itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@AuthenticationPrincipal SecurityUserDetails principal,
                                                     @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(principal.getId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart(@AuthenticationPrincipal SecurityUserDetails principal) {
        return ResponseEntity.ok(cartService.clearCart(principal.getId()));
    }

    @PostMapping("/merge")
    public ResponseEntity<CartResponse> mergeCart(@AuthenticationPrincipal SecurityUserDetails principal,
                                                    @Valid @RequestBody CartMergeRequest request) {
        return ResponseEntity.ok(cartService.mergeCart(principal.getId(), request));
    }
}
