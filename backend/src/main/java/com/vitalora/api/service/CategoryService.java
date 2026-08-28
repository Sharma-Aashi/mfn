package com.vitalora.api.service;

import com.vitalora.api.dto.category.CategoryRequest;
import com.vitalora.api.dto.category.CategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllActive();

    List<CategoryResponse> getAllForAdmin();

    CategoryResponse getBySlug(String slug);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);

    CategoryResponse updateStatus(Long id, boolean active);

    CategoryResponse uploadImage(Long id, MultipartFile file);
}
