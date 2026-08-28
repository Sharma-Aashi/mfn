package com.vitalora.api.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(
        @NotBlank(message = "Name is required") @Size(max = 150) String name,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
        @Size(max = 20) String phone,
        @NotBlank(message = "Subject is required") @Size(max = 200) String subject,
        @NotBlank(message = "Message is required") @Size(max = 4000) String message
) {
}
