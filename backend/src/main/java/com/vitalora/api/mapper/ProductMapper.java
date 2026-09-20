package com.vitalora.api.mapper;

import com.vitalora.api.dto.category.CategoryResponse;
import com.vitalora.api.dto.product.ProductImageResponse;
import com.vitalora.api.dto.product.ProductResponse;
import com.vitalora.api.dto.product.ProductSummaryResponse;
import com.vitalora.api.dto.product.ProductSpecResponse;
import com.vitalora.api.dto.product.ProductVariantResponse;
import com.vitalora.api.entity.Inventory;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.ProductImage;
import com.vitalora.api.entity.ProductVariant;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

public final class ProductMapper {

    private static final Comparator<ProductVariant> VARIANT_ORDER =
            Comparator.comparingInt(ProductVariant::getDisplayOrder)
                    .thenComparing(ProductVariant::getId, Comparator.nullsLast(Comparator.naturalOrder()));

    private ProductMapper() {
    }

    public static String primaryImageUrl(Product product) {
        return product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .findFirst()
                .or(() -> product.getImages().stream().min(Comparator.comparingInt(ProductImage::getDisplayOrder)))
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }

    public static int stockOf(ProductVariant variant) {
        Inventory inv = variant.getInventory();
        return inv != null ? inv.getStockQuantity() : 0;
    }

    /** A product is buyable when any one of its active variants is. */
    public static int totalStock(Product product) {
        return product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .mapToInt(ProductMapper::stockOf)
                .sum();
    }

    public static boolean isInStock(Product product) {
        return totalStock(product) > 0;
    }

    private static List<ProductVariant> activeVariantsInOrder(Product product) {
        return product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .sorted(VARIANT_ORDER)
                .toList();
    }

    public static ProductVariantResponse toVariantResponse(ProductVariant variant) {
        Inventory inv = variant.getInventory();
        int stock = inv != null ? inv.getStockQuantity() : 0;
        int threshold = inv != null ? inv.getLowStockThreshold() : 0;
        return new ProductVariantResponse(
                variant.getId(),
                variant.getSku(),
                variant.getFlavour(),
                variant.getSizeLabel(),
                variant.getSizeValue(),
                variant.getSizeUnit(),
                variant.getLabel(),
                variant.getPrice(),
                variant.getSalePrice(),
                variant.getEffectivePrice(),
                variant.getImageUrl(),
                variant.isActive(),
                variant.isDefaultVariant(),
                variant.getDisplayOrder(),
                stock,
                threshold,
                stock > 0
        );
    }

    public static ProductSummaryResponse toSummary(Product product) {
        int activeVariants = (int) product.getVariants().stream().filter(ProductVariant::isActive).count();
        BigDecimal fromPrice = product.getFromPrice();
        ProductVariant defaultVariant = product.getDefaultVariant();
        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                product.getShortDescription(),
                product.getPrice(),
                product.getSalePrice(),
                product.getEffectivePrice(),
                fromPrice,
                activeVariants > 1,
                activeVariants,
                defaultVariant != null ? defaultVariant.getId() : null,
                product.getCurrency(),
                primaryImageUrl(product),
                BrandMapper.toSummary(product.getBrand()),
                product.getAvgRating(),
                product.getReviewCount(),
                product.isActive(),
                product.isFeatured(),
                product.isBestSeller(),
                product.isNewArrival(),
                isInStock(product)
        );
    }

    public static ProductResponse toResponse(Product product) {
        List<ProductImageResponse> images = product.getImages().stream()
                .sorted(Comparator.comparingInt(ProductImage::getDisplayOrder))
                .map(img -> new ProductImageResponse(img.getId(), img.getImageUrl(), img.getAltText(),
                        img.getDisplayOrder(), img.isPrimary()))
                .toList();

        List<CategoryResponse> categories = product.getCategories().stream()
                .map(c -> new CategoryResponse(
                        c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(),
                        c.isActive(), c.getDisplayOrder(), 0,
                        c.getParent() != null ? c.getParent().getId() : null,
                        c.getParent() != null ? c.getParent().getName() : null,
                        List.of()))
                .toList();

        List<ProductVariant> variants = product.getVariants().stream().sorted(VARIANT_ORDER).toList();
        List<ProductVariantResponse> variantResponses = variants.stream()
                .map(ProductMapper::toVariantResponse)
                .toList();

        ProductVariant defaultVariant = product.getDefaultVariant();
        int stock = totalStock(product);
        int threshold = activeVariantsInOrder(product).stream()
                .map(ProductVariant::getInventory)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Inventory::getLowStockThreshold)
                .max()
                .orElse(0);

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                product.getShortDescription(),
                product.getDescription(),
                product.getBenefits(),
                product.getIngredients(),
                product.getNutritionalInfo(),
                product.getUsageInstructions(),
                product.getWarnings(),
                product.getPrice(),
                product.getSalePrice(),
                product.getEffectivePrice(),
                product.getFromPrice(),
                product.getCurrency(),
                product.isActive(),
                product.isFeatured(),
                product.isBestSeller(),
                product.isNewArrival(),
                product.getAvgRating(),
                product.getReviewCount(),
                product.getTags(),
                stock,
                threshold,
                stock > 0,
                BrandMapper.toSummary(product.getBrand()),
                variantResponses,
                product.getSpecs().stream()
                        .map(sp -> new ProductSpecResponse(sp.getId(), sp.getLabel(), sp.getValue(), sp.getDisplayOrder()))
                        .toList(),
                defaultVariant != null ? defaultVariant.getId() : null,
                images,
                categories,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
