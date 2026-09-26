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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    /**
     * What the storefront is allowed to show. Three rules, in order:
     *
     *   1. the admin's Active switch wins - an unchecked category is off;
     *   2. switching a parent off takes its children with it, because the
     *      menu is rendered from the roots down and an orphaned child would
     *      otherwise disappear from the tree while still answering on its
     *      own URL;
     *   3. a category with nothing in it is dropped, even when active. An
     *      empty category is a dead end: it is offered in the menu, clicked,
     *      and shows "no products found".
     *
     * Admins keep seeing everything through getAllForAdmin(), so a category
     * being invisible here is never the same as it not existing.
     */
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActive() {
        List<Category> active = categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .toList();

        Set<Long> activeIds = active.stream().map(Category::getId).collect(Collectors.toSet());

        return active.stream()
                .filter(c -> c.getParent() == null || activeIds.contains(c.getParent().getId()))
                .sorted(Comparator.comparingInt(Category::getDisplayOrder))
                .map(this::toResponseWithCount)
                // The count is the whole subtree, so a parent stocked only
                // through its children survives this filter.
                .filter(c -> c.productCount() > 0)
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
                .parent(resolveParent(request.parentId(), null))
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
        category.setParent(resolveParent(request.parentId(), id));

        return toResponseWithCount(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = findEntity(id);
        long childCount = categoryRepository.countByParentId(id);
        if (childCount > 0) {
            throw new BadRequestException("Cannot delete a category that still has " + childCount +
                    " sub-categorie(s). Remove or move those first.");
        }
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

    /**
     * Resolves the parent, refusing a category that would become its own ancestor.
     * Only two levels are expected in practice, but the walk costs nothing and a
     * cycle here would hang every menu render.
     */
    private Category resolveParent(Long parentId, Long selfId) {
        if (parentId == null) {
            return null;
        }
        if (parentId.equals(selfId)) {
            throw new BadRequestException("A category cannot be its own parent.");
        }
        Category parent = findEntity(parentId);
        for (Category ancestor = parent.getParent(); ancestor != null; ancestor = ancestor.getParent()) {
            if (ancestor.getId().equals(selfId)) {
                throw new BadRequestException("That parent would create a loop in the category tree.");
            }
        }
        return parent;
    }

    private Category findEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }

    private CategoryResponse toResponseWithCount(Category category) {
        return CategoryMapper.toResponse(category, productRepository.countInCategoryTree(category.getId()));
    }
}
