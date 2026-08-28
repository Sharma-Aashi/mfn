package com.vitalora.api.service;

import com.vitalora.api.dto.cart.AddCartItemRequest;
import com.vitalora.api.dto.cart.CartMergeRequest;
import com.vitalora.api.dto.cart.CartResponse;
import com.vitalora.api.dto.cart.UpdateCartItemRequest;

public interface CartService {
    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, AddCartItemRequest request);

    CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, Long itemId);

    CartResponse clearCart(Long userId);

    CartResponse mergeCart(Long userId, CartMergeRequest request);
}
