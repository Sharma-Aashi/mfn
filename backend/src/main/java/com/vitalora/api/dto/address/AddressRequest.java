package com.vitalora.api.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
        @NotBlank(message = "Full name is required") @Size(max = 150) String fullName,
        @NotBlank(message = "Phone is required") @Size(max = 20) String phone,
        @NotBlank(message = "Address line 1 is required") @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @NotBlank(message = "City is required") @Size(max = 100) String city,
        @NotBlank(message = "State is required") @Size(max = 100) String state,
        @NotBlank(message = "Postal code is required") @Size(max = 20) String postalCode,
        @Size(max = 100) String country,
        Boolean isDefault
) {
}
