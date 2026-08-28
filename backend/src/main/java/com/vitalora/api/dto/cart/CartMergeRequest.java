package com.vitalora.api.dto.cart;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.util.List;

public record CartMergeRequest(
        @NotNull @Valid List<AddCartItemRequest> items
) {
}
