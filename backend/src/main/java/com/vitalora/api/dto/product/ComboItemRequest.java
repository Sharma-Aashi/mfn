package com.vitalora.api.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * One line of a stack's contents, as the admin submits it.
 *
 * <p>Only the variant and how many of it: name, picture and price are read off
 * the variant itself, so a stack cannot describe its contents differently from
 * how they are actually sold.
 */
public record ComboItemRequest(
        @NotNull(message = "Pick a product option for every line of the stack") Long variantId,
        @Min(value = 1, message = "Quantity must be at least 1") Integer quantity,
        Integer displayOrder
) {
}
