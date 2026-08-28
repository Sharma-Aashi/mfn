package com.vitalora.api.dto.common;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Active flag is required") Boolean active
) {
}
