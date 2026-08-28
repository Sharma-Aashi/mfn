package com.vitalora.api.dto.order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotBlank(message = "Full name is required") @Size(max = 150) String customerFullName,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String customerEmail,
        @NotBlank(message = "Phone is required") @Size(max = 20) String customerPhone,
        @NotBlank(message = "Address line 1 is required") @Size(max = 255) String shippingAddressLine1,
        @Size(max = 255) String shippingAddressLine2,
        @NotBlank(message = "City is required") @Size(max = 100) String shippingCity,
        @NotBlank(message = "State is required") @Size(max = 100) String shippingState,
        @NotBlank(message = "Postal code is required") @Size(max = 20) String shippingPostalCode,
        @Size(max = 100) String shippingCountry,
        @Size(max = 500) String customerNotes,
        Boolean saveAddress
) {
}
