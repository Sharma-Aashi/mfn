package com.vitalora.api.mapper;

import com.vitalora.api.dto.faq.FaqResponse;
import com.vitalora.api.entity.Faq;

public final class FaqMapper {

    private FaqMapper() {
    }

    public static FaqResponse toResponse(Faq faq) {
        return new FaqResponse(
                faq.getId(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getCategory().name(),
                faq.getDisplayOrder(),
                faq.isActive()
        );
    }
}
