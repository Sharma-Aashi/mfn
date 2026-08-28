package com.vitalora.api.service;

import com.vitalora.api.dto.faq.FaqReorderRequest;
import com.vitalora.api.dto.faq.FaqRequest;
import com.vitalora.api.dto.faq.FaqResponse;

import java.util.List;

public interface FaqService {
    List<FaqResponse> getActive(String category, String search);

    List<FaqResponse> getAllForAdmin();

    FaqResponse create(FaqRequest request);

    FaqResponse update(Long id, FaqRequest request);

    void delete(Long id);

    FaqResponse updateStatus(Long id, boolean active);

    void reorder(FaqReorderRequest request);
}
