package com.vitalora.api.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotNull(message = "Rating is required") @Min(1) @Max(5) Integer rating,
        @Size(max = 150) String title,
        @Size(max = 2000) String comment
) {
}
