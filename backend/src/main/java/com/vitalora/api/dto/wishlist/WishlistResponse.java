package com.vitalora.api.dto.wishlist;

import java.util.List;

public record WishlistResponse(
        List<WishlistItemResponse> items
) {
}
