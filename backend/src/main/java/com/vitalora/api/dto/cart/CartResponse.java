package com.vitalora.api.dto.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Long id,
        List<CartItemResponse> items,
        int itemCount,
        BigDecimal subtotal
) {
}
