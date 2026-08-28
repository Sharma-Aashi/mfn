package com.vitalora.api.service.impl;

import com.vitalora.api.dto.category.CategoryRequest;
import com.vitalora.api.dto.category.CategoryResponse;
import com.vitalora.api.entity.Category;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.DuplicateResourceException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.CategoryMapper;
import com.vitalora.api.repository.CategoryRepository;
import com.vitalora.api.repository.ProductRepository;
import com.vitalora.api.service.CategoryService;
import com.vitalora.api.service.FileStorageService;
import com.vitalora.api.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActive() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .sorted(Comparator.comparingInt(Category::getDisplayOrder))
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllForAdmin() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Category::getDisplayOrder))
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", slug));
        return toResponseWithCount(category);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String slug = (request.slug() != null && !request.slug().isBlank())
                ? SlugUtil.slugify(request.slug())
                : SlugUtil.slugify(request.name());
        if (categoryRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("A category with slug '" + slug + "' already exists.");
        }

        Category category = Category.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .imageUrl(request.imageUrl())
                .active(request.active() == null || request.active())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();

        return toResponseWithCount(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findEntity(id);

        String slug = (request.slug() != null && !request.slug().isBlank())
                ? SlugUtil.slugify(request.slug())
                : SlugUtil.slugify(request.name());
        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new DuplicateResourceException("A category with slug '" + slug + "' already exists.");
        }

        category.setName(request.name());
        category.setSlug(slug);
        category.setDescription(request.description());
        if (request.imageUrl() != null) {
            category.setImageUrl(request.imageUrl());
        }
        if (request.active() != null) {
            category.setActive(request.active());
        }
        if (request.displayOrder() != null) {
            category.setDisplayOrder(request.displayOrder());
        }

        return toResponseWithCount(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = findEntity(id);
        long productCount = productRepository.countByCategories_Id(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete a category that still has " + productCount +
                    " product(s) assigned. Reassign or remove those products first.");
        }
        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateStatus(Long id, boolean active) {
        Category category = findEntity(id);
        category.setActive(active);
        return toResponseWithCount(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse uploadImage(Long id, MultipartFile file) {
        Category category = findEntity(id);
        String url = fileStorageService.store(file, "categories");
        category.setImageUrl(url);
        return toResponseWithCount(categoryRepository.save(category));
    }

    private Category findEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }

    private CategoryResponse toResponseWithCount(Category category) {
        long count = productRepository.countByCategories_Id(category.getId());
        return CategoryMapper.toResponse(category, count);
    }
}
