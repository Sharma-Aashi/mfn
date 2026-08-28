package com.vitalora.api.dto.faq;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record FaqReorderRequest(
        @NotEmpty(message = "FAQ id order list cannot be empty") List<Long> faqIds
) {
}
