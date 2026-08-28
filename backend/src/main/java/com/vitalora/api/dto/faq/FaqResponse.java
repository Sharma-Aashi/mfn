package com.vitalora.api.dto.faq;

public record FaqResponse(
        Long id,
        String question,
        String answer,
        String category,
        int displayOrder,
        boolean active
) {
}
