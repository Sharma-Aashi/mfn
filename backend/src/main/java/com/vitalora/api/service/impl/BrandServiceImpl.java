package com.vitalora.api.service.impl;

import com.vitalora.api.dto.brand.BrandRequest;
import com.vitalora.api.dto.brand.BrandResponse;
import com.vitalora.api.entity.Brand;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.DuplicateResourceException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.BrandMapper;
import com.vitalora.api.repository.BrandRepository;
import com.vitalora.api.repository.ProductRepository;
import com.vitalora.api.service.BrandService;
import com.vitalora.api.service.FileStorageService;
import com.vitalora.api.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllActive() {
        return brandRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getFeatured() {
        return brandRepository.findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> getAllForAdmin() {
        return brandRepository.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BrandResponse getBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Brand", slug));
        return toResponseWithCount(brand);
    }

    @Override
    @Transactional
    public BrandResponse create(BrandRequest request) {
        String slug = resolveSlug(request);
        if (brandRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("A brand with slug '" + slug + "' already exists.");
        }

        Brand brand = Brand.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .logoUrl(request.logoUrl())
                .bannerUrl(request.bannerUrl())
                .countryOfOrigin(request.countryOfOrigin())
                .websiteUrl(request.websiteUrl())
                .houseBrand(Boolean.TRUE.equals(request.houseBrand()))
                .authorizedReseller(Boolean.TRUE.equals(request.authorizedReseller()))
                .active(request.active() == null || request.active())
                .featured(Boolean.TRUE.equals(request.featured()))
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();

        return toResponseWithCount(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = findEntity(id);

        String slug = resolveSlug(request);
        if (brandRepository.existsBySlugAndIdNot(slug, id)) {
            throw new DuplicateResourceException("A brand with slug '" + slug + "' already exists.");
        }

        brand.setName(request.name());
        brand.setSlug(slug);
        brand.setDescription(request.description());
        if (request.logoUrl() != null) {
            brand.setLogoUrl(request.logoUrl());
        }
        if (request.bannerUrl() != null) {
            brand.setBannerUrl(request.bannerUrl());
        }
        brand.setCountryOfOrigin(request.countryOfOrigin());
        brand.setWebsiteUrl(request.websiteUrl());
        if (request.houseBrand() != null) {
            brand.setHouseBrand(request.houseBrand());
        }
        if (request.authorizedReseller() != null) {
            brand.setAuthorizedReseller(request.authorizedReseller());
        }
        if (request.active() != null) {
            brand.setActive(request.active());
        }
        if (request.featured() != null) {
            brand.setFeatured(request.featured());
        }
        if (request.displayOrder() != null) {
            brand.setDisplayOrder(request.displayOrder());
        }

        return toResponseWithCount(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Brand brand = findEntity(id);
        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete a brand that still has " + productCount +
                    " product(s). Move those products to another brand first.");
        }
        if (brand.isHouseBrand() && brandRepository.countByHouseBrandTrue() <= 1) {
            throw new BadRequestException("Cannot delete the only house brand.");
        }
        brandRepository.delete(brand);
    }

    @Override
    @Transactional
    public BrandResponse updateStatus(Long id, boolean active) {
        Brand brand = findEntity(id);
        brand.setActive(active);
        return toResponseWithCount(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse uploadLogo(Long id, MultipartFile file) {
        Brand brand = findEntity(id);
        String url = fileStorageService.store(file, "brands");
        brand.setLogoUrl(url);
        return toResponseWithCount(brandRepository.save(brand));
    }

    private static String resolveSlug(BrandRequest request) {
        return (request.slug() != null && !request.slug().isBlank())
                ? SlugUtil.slugify(request.slug())
                : SlugUtil.slugify(request.name());
    }

    private Brand findEntity(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Brand", id));
    }

    private BrandResponse toResponseWithCount(Brand brand) {
        return BrandMapper.toResponse(brand, productRepository.countByBrandId(brand.getId()));
    }
}
