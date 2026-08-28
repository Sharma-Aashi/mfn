package com.vitalora.api.service;

import com.vitalora.api.dto.wishlist.WishlistResponse;

public interface WishlistService {
    WishlistResponse getWishlist(Long userId);

    WishlistResponse addItem(Long userId, Long productId);

    WishlistResponse removeItem(Long userId, Long productId);
}
