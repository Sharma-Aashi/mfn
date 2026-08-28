package com.vitalora.api.dto.common;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkStatusRequest(
        @NotEmpty(message = "Select at least one item") List<Long> ids,
        @NotNull(message = "Active flag is required") Boolean active
) {
}
