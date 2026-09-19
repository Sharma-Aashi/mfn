package com.vitalora.api.service;

import com.vitalora.api.dto.brand.BrandRequest;
import com.vitalora.api.dto.brand.BrandResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BrandService {
    List<BrandResponse> getAllActive();

    List<BrandResponse> getFeatured();

    List<BrandResponse> getAllForAdmin();

    BrandResponse getBySlug(String slug);

    BrandResponse create(BrandRequest request);

    BrandResponse update(Long id, BrandRequest request);

    void delete(Long id);

    BrandResponse updateStatus(Long id, boolean active);

    BrandResponse uploadLogo(Long id, MultipartFile file);
}
