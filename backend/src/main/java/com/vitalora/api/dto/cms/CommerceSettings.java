package com.vitalora.api.dto.cms;

import java.math.BigDecimal;

/**
 * Admin-editable commerce rules (CMS page "site", section "commerce").
 * Defaults are used whenever the section is missing or malformed so a bad
 * edit can never stop orders from being placed.
 */
public record CommerceSettings(
        BigDecimal freeShippingThreshold,
        BigDecimal shippingFee,
        int estimatedDeliveryDays
) {
    public static CommerceSettings defaults() {
        return new CommerceSettings(new BigDecimal("999.00"), new BigDecimal("79.00"), 5);
    }
}
