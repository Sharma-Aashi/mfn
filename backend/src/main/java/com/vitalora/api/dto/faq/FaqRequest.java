package com.vitalora.api.dto.faq;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaqRequest(
        @NotBlank(message = "Question is required") @Size(max = 300) String question,
        @NotBlank(message = "Answer is required") String answer,
        @NotBlank(message = "Category is required") String category,
        Integer displayOrder,
        Boolean active
) {
}
