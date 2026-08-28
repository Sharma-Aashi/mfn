package com.vitalora.api.mapper;

import com.vitalora.api.dto.product.ProductImageResponse;
import com.vitalora.api.dto.product.ProductResponse;
import com.vitalora.api.dto.product.ProductSummaryResponse;
import com.vitalora.api.entity.Inventory;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.ProductImage;

import java.util.Comparator;
import java.util.List;

public final class ProductMapper {

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

    public static boolean isInStock(Product product) {
        Inventory inv = product.getInventory();
        return inv != null && inv.getStockQuantity() > 0;
    }

    public static ProductSummaryResponse toSummary(Product product) {
        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                product.getShortDescription(),
                product.getPrice(),
                product.getSalePrice(),
                product.getEffectivePrice(),
                product.getCurrency(),
                primaryImageUrl(product),
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

        List<com.vitalora.api.dto.category.CategoryResponse> categories = product.getCategories().stream()
                .map(c -> new com.vitalora.api.dto.category.CategoryResponse(
                        c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(),
                        c.isActive(), c.getDisplayOrder(), 0))
                .toList();

        Inventory inv = product.getInventory();
        int stock = inv != null ? inv.getStockQuantity() : 0;
        int threshold = inv != null ? inv.getLowStockThreshold() : 0;

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
                images,
                categories,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
