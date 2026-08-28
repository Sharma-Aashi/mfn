package com.vitalora.api.dto.contact;

import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String name,
        String email,
        String phone,
        String subject,
        String message,
        boolean read,
        Instant createdAt
) {
}
