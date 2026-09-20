package com.vitalora.api.service.impl;

import com.vitalora.api.config.AppProperties;
import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.product.ProductFacetsResponse;
import com.vitalora.api.dto.product.ProductFilter;
import com.vitalora.api.dto.product.ProductImageOrderRequest;
import com.vitalora.api.dto.product.ProductImageUpdateRequest;
import com.vitalora.api.dto.product.ProductRequest;
import com.vitalora.api.dto.product.ProductResponse;
import com.vitalora.api.dto.product.ProductSummaryResponse;
import com.vitalora.api.dto.product.ProductSpecRequest;
import com.vitalora.api.dto.product.ProductVariantRequest;
import com.vitalora.api.entity.Brand;
import com.vitalora.api.entity.Category;
import com.vitalora.api.entity.Inventory;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.ProductImage;
import com.vitalora.api.entity.ProductSpec;
import com.vitalora.api.entity.ProductVariant;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.DuplicateResourceException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.BrandRepository;
import com.vitalora.api.repository.CategoryRepository;
import com.vitalora.api.repository.ProductRepository;
import com.vitalora.api.repository.ProductVariantRepository;
import com.vitalora.api.mapper.BrandMapper;
import com.vitalora.api.service.FileStorageService;
import com.vitalora.api.service.ProductService;
import com.vitalora.api.specification.ProductSpecification;
import com.vitalora.api.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository variantRepository;
    private final FileStorageService fileStorageService;
    private final AppProperties appProperties;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> search(ProductFilter filter, int page, int size) {
        String sort = filter.sort();
        Specification<Product> spec = and(
                ProductSpecification.isActive(true),
                ProductSpecification.search(filter.q()),
                ProductSpecification.hasCategorySlugOrDescendant(filter.category()),
                ProductSpecification.hasBrandSlugs(filter.brands()),
                ProductSpecification.hasFlavours(filter.flavours()),
                ProductSpecification.hasSizeLabels(filter.sizes()),
                ProductSpecification.priceBetween(filter.minPrice(), filter.maxPrice()),
                ProductSpecification.minRating(filter.minRating()),
                ProductSpecification.inStockOnly(Boolean.TRUE.equals(filter.inStockOnly())),
                priceOrderSpec(sort)
        );

        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return PageResponse.of(productRepository.findAll(spec, pageable), ProductMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductFacetsResponse getFacets() {
        var brands = brandRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(BrandMapper::toSummary)
                .toList();
        return new ProductFacetsResponse(
                brands,
                variantRepository.findDistinctFlavours(),
                variantRepository.findDistinctSizeLabels(),
                variantRepository.findMinEffectivePrice(),
                variantRepository.findMaxEffectivePrice()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchForAdmin(String q, Boolean active, String category, String brand,
                                                          int page, int size, String sort) {
        Specification<Product> spec = and(
                ProductSpecification.search(q),
                ProductSpecification.hasCategorySlugOrDescendant(category),
                brand != null && !brand.isBlank() ? ProductSpecification.hasBrandSlugs(List.of(brand)) : null,
                active != null ? ProductSpecification.isActive(active) : null,
                priceOrderSpec(sort)
        );

        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return PageResponse.of(productRepository.findAll(spec, pageable), ProductMapper::toResponse);
    }

    /**
     * Combines specifications with AND, silently skipping any null entries (Spring Data's
     * own Specification#and rejects a null argument outright rather than treating it as a no-op).
     */
    @SafeVarargs
    private Specification<Product> and(Specification<Product>... specs) {
        return Specification.allOf(java.util.Arrays.stream(specs).filter(java.util.Objects::nonNull).toList());
    }

    private Specification<Product> priceOrderSpec(String sort) {
        if ("price_low".equals(sort)) {
            return ProductSpecification.orderByEffectivePrice(true);
        }
        if ("price_high".equals(sort)) {
            return ProductSpecification.orderByEffectivePrice(false);
        }
        return null;
    }

    private Sort resolveSort(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Order.desc("bestSeller"), Sort.Order.desc("reviewCount"));
        }
        return switch (sort) {
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "price_low", "price_high" -> Sort.unsorted();
            case "rating" -> Sort.by(Sort.Direction.DESC, "avgRating");
            default -> Sort.by(Sort.Order.desc("bestSeller"), Sort.Order.desc("reviewCount"));
        };
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", slug));
        return ProductMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductMapper.toResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getFeatured() {
        Specification<Product> spec = Specification.where(ProductSpecification.isActive(true))
                .and(ProductSpecification.isFeatured());
        return productRepository.findAll(spec, PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(ProductMapper::toSummary).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getBestSellers() {
        Specification<Product> spec = Specification.where(ProductSpecification.isActive(true))
                .and(ProductSpecification.isBestSeller());
        return productRepository.findAll(spec, PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "avgRating")))
                .map(ProductMapper::toSummary).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getNewArrivals() {
        Specification<Product> spec = Specification.where(ProductSpecification.isActive(true))
                .and(ProductSpecification.isNewArrival());
        return productRepository.findAll(spec, PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(ProductMapper::toSummary).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getRelated(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", slug));
        List<Long> categoryIds = product.getCategories().stream().map(Category::getId).toList();
        if (categoryIds.isEmpty()) {
            return List.of();
        }
        return productRepository.findRelated(product.getId(), categoryIds).stream()
                .limit(4)
                .map(ProductMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        String slug = (request.slug() != null && !request.slug().isBlank())
                ? SlugUtil.slugify(request.slug())
                : SlugUtil.slugify(request.name());
        if (productRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("A product with slug '" + slug + "' already exists.");
        }
        if (productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("A product with SKU '" + request.sku() + "' already exists.");
        }

        Product product = Product.builder()
                .name(request.name())
                .slug(slug)
                .sku(request.sku())
                .shortDescription(request.shortDescription())
                .description(request.description())
                .benefits(request.benefits())
                .ingredients(request.ingredients())
                .nutritionalInfo(request.nutritionalInfo())
                .usageInstructions(request.usageInstructions())
                .warnings(request.warnings())
                .price(request.price())
                .salePrice(request.salePrice())
                .active(request.active() == null || request.active())
                .featured(Boolean.TRUE.equals(request.featured()))
                .bestSeller(Boolean.TRUE.equals(request.bestSeller()))
                .newArrival(Boolean.TRUE.equals(request.newArrival()))
                .tags(request.tags())
                .brand(resolveBrand(request.brandId()))
                .categories(resolveCategories(request.categoryIds()))
                .build();

        syncVariants(product, request);
        syncSpecs(product, request);

        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findEntity(id);

        String slug = (request.slug() != null && !request.slug().isBlank())
                ? SlugUtil.slugify(request.slug())
                : SlugUtil.slugify(request.name());
        if (productRepository.existsBySlugAndIdNot(slug, id)) {
            throw new DuplicateResourceException("A product with slug '" + slug + "' already exists.");
        }
        if (productRepository.existsBySkuAndIdNot(request.sku(), id)) {
            throw new DuplicateResourceException("A product with SKU '" + request.sku() + "' already exists.");
        }

        product.setName(request.name());
        product.setSlug(slug);
        product.setSku(request.sku());
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setBenefits(request.benefits());
        product.setIngredients(request.ingredients());
        product.setNutritionalInfo(request.nutritionalInfo());
        product.setUsageInstructions(request.usageInstructions());
        product.setWarnings(request.warnings());
        product.setPrice(request.price());
        product.setSalePrice(request.salePrice());
        if (request.active() != null) {
            product.setActive(request.active());
        }
        product.setFeatured(Boolean.TRUE.equals(request.featured()));
        product.setBestSeller(Boolean.TRUE.equals(request.bestSeller()));
        product.setNewArrival(Boolean.TRUE.equals(request.newArrival()));
        product.setTags(request.tags());
        product.setBrand(resolveBrand(request.brandId()));
        product.setCategories(resolveCategories(request.categoryIds()));

        syncVariants(product, request);
        syncSpecs(product, request);

        return ProductMapper.toResponse(productRepository.save(product));
    }

    /**
     * Specs are small and fully ordered, so the list is replaced wholesale
     * rather than diffed. A null list leaves them alone; an empty one clears.
     */
    private void syncSpecs(Product product, ProductRequest request) {
        List<ProductSpecRequest> requested = request.specs();
        if (requested == null) {
            return;
        }
        product.getSpecs().clear();
        int order = 0;
        for (ProductSpecRequest sr : requested) {
            if (sr.label() == null || sr.label().isBlank() || sr.value() == null || sr.value().isBlank()) {
                continue;
            }
            product.addSpec(ProductSpec.builder()
                    .label(sr.label().trim())
                    .value(sr.value().trim())
                    .displayOrder(sr.displayOrder() != null ? sr.displayOrder() : order)
                    .build());
            order++;
        }
    }

    private Brand resolveBrand(Long brandId) {
        return brandRepository.findById(brandId)
                .orElseThrow(() -> ResourceNotFoundException.of("Brand", brandId));
    }

    /**
     * Brings the product's variants in line with the request.
     *
     * <p>An empty variant list means "single-SKU product": exactly one default
     * variant is kept, mirroring the product's own SKU, price and stock, so the
     * simple admin form keeps working unchanged. A non-empty list is authoritative
     * — variants absent from it are removed.
     */
    private void syncVariants(Product product, ProductRequest request) {
        int fallbackThreshold = appProperties.getInventory().getDefaultLowStockThreshold();
        List<ProductVariantRequest> requested = request.variants();

        if (requested == null || requested.isEmpty()) {
            ProductVariant variant = product.getDefaultVariant();
            if (variant == null) {
                variant = product.getVariants().stream().findFirst().orElse(null);
            }
            if (variant == null) {
                variant = ProductVariant.builder()
                        .sku(request.sku())
                        .sizeLabel("Standard")
                        .price(request.price())
                        .salePrice(request.salePrice())
                        .active(true)
                        .defaultVariant(true)
                        .displayOrder(0)
                        .build();
                product.addVariant(variant);
            } else {
                variant.setSku(request.sku());
                variant.setPrice(request.price());
                variant.setSalePrice(request.salePrice());
                variant.setActive(true);
                variant.setDefaultVariant(true);
            }
            applyStock(variant, request.stockQuantity(), request.lowStockThreshold(), fallbackThreshold);

            ProductVariant kept = variant;
            product.getVariants().removeIf(v -> v != kept);
            return;
        }

        Map<Long, ProductVariant> existing = new HashMap<>();
        for (ProductVariant v : product.getVariants()) {
            if (v.getId() != null) {
                existing.put(v.getId(), v);
            }
        }

        List<ProductVariant> resulting = new ArrayList<>();
        int order = 0;
        boolean defaultSeen = false;

        for (ProductVariantRequest vr : requested) {
            ProductVariant variant = vr.id() != null ? existing.get(vr.id()) : null;
            if (variant == null) {
                variant = new ProductVariant();
                product.addVariant(variant);
            }
            variant.setSku(vr.sku());
            variant.setFlavour(blankToNull(vr.flavour()));
            variant.setSizeLabel(blankToNull(vr.sizeLabel()));
            variant.setSizeValue(vr.sizeValue());
            variant.setSizeUnit(blankToNull(vr.sizeUnit()));
            variant.setPrice(vr.price());
            variant.setSalePrice(vr.salePrice());
            variant.setImageUrl(blankToNull(vr.imageUrl()));
            variant.setActive(vr.active() == null || vr.active());
            variant.setDisplayOrder(vr.displayOrder() != null ? vr.displayOrder() : order);

            // At most one default: the first one flagged wins, and if none is
            // flagged the first variant becomes it.
            boolean wantsDefault = Boolean.TRUE.equals(vr.defaultVariant()) && !defaultSeen;
            variant.setDefaultVariant(wantsDefault);
            defaultSeen = defaultSeen || wantsDefault;

            applyStock(variant, vr.stockQuantity(), vr.lowStockThreshold(), fallbackThreshold);
            resulting.add(variant);
            order++;
        }

        if (!defaultSeen && !resulting.isEmpty()) {
            resulting.get(0).setDefaultVariant(true);
        }

        product.getVariants().removeIf(v -> !resulting.contains(v));
    }

    private void applyStock(ProductVariant variant, Integer stockQuantity, Integer threshold, int fallbackThreshold) {
        Inventory inventory = variant.getInventory();
        if (inventory == null) {
            inventory = Inventory.builder().variant(variant).lowStockThreshold(fallbackThreshold).build();
            variant.setInventory(inventory);
        }
        if (stockQuantity != null) {
            inventory.setStockQuantity(stockQuantity);
        }
        if (threshold != null) {
            inventory.setLowStockThreshold(threshold);
        }
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = findEntity(id);
        product.getImages().forEach(img -> fileStorageService.delete(img.getImageUrl()));
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse updateStatus(Long id, boolean active) {
        Product product = findEntity(id);
        product.setActive(active);
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void bulkUpdateStatus(List<Long> ids, boolean active) {
        List<Product> products = productRepository.findAllById(ids);
        products.forEach(p -> p.setActive(active));
        productRepository.saveAll(products);
    }

    @Override
    @Transactional
    public ProductResponse addImage(Long productId, MultipartFile file, boolean primary) {
        Product product = findEntity(productId);
        String url = fileStorageService.store(file, "products");

        boolean makePrimary = primary || product.getImages().isEmpty();
        if (makePrimary) {
            product.getImages().forEach(img -> img.setPrimary(false));
        }

        int nextOrder = product.getImages().stream().mapToInt(ProductImage::getDisplayOrder).max().orElse(-1) + 1;
        ProductImage image = ProductImage.builder()
                .imageUrl(url)
                .displayOrder(nextOrder)
                .primary(makePrimary)
                .altText(product.getName())
                .build();
        product.addImage(image);

        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        Product product = findEntity(productId);
        ProductImage target = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.of("Product image", imageId));

        boolean wasPrimary = target.isPrimary();
        product.getImages().remove(target);
        fileStorageService.delete(target.getImageUrl());

        if (wasPrimary && !product.getImages().isEmpty()) {
            product.getImages().get(0).setPrimary(true);
        }
        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductResponse reorderImages(Long productId, ProductImageOrderRequest request) {
        Product product = findEntity(productId);
        for (int i = 0; i < request.imageIds().size(); i++) {
            final int order = i;
            Long imageId = request.imageIds().get(i);
            ProductImage image = product.getImages().stream()
                    .filter(img -> img.getId().equals(imageId))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Image " + imageId + " does not belong to this product."));
            image.setDisplayOrder(order);
        }
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateImage(Long productId, Long imageId, ProductImageUpdateRequest request) {
        Product product = findEntity(productId);
        ProductImage target = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.of("Product image", imageId));

        if (request.altText() != null) {
            target.setAltText(request.altText().isBlank() ? product.getName() : request.altText().trim());
        }
        if (Boolean.TRUE.equals(request.primary())) {
            product.getImages().forEach(img -> img.setPrimary(img == target));
        }
        return ProductMapper.toResponse(productRepository.save(product));
    }

    private Set<Category> resolveCategories(Set<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return new LinkedHashSet<>();
        }
        List<Category> found = categoryRepository.findAllById(categoryIds);
        if (found.size() != categoryIds.size()) {
            throw new BadRequestException("One or more selected categories do not exist.");
        }
        return new LinkedHashSet<>(found);
    }

    private Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", id));
    }
}
