package com.vitalora.api.specification;

import com.vitalora.api.entity.Brand;
import com.vitalora.api.entity.Category;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.ProductVariant;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    private static boolean isEmpty(List<String> values) {
        return values == null || values.isEmpty();
    }

    public static Specification<Product> isActive(boolean active) {
        return (root, query, cb) -> cb.equal(root.get("active"), active);
    }

    public static Specification<Product> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String like = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Product, Brand> brand = root.join("brand", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("shortDescription")), like),
                    cb.like(cb.lower(root.get("tags")), like),
                    cb.like(cb.lower(brand.get("name")), like)
            );
        };
    }

    public static Specification<Product> hasCategorySlug(String categorySlug) {
        if (categorySlug == null || categorySlug.isBlank()) {
            return null;
        }
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Product, Category> join = root.join("categories", JoinType.INNER);
            return cb.equal(join.get("slug"), categorySlug);
        };
    }

    /**
     * Matches the category itself or any of its children, so picking "Proteins"
     * also returns everything filed under "Whey Isolate".
     */
    public static Specification<Product> hasCategorySlugOrDescendant(String categorySlug) {
        if (categorySlug == null || categorySlug.isBlank()) {
            return null;
        }
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Product, Category> join = root.join("categories", JoinType.INNER);
            Join<Category, Category> parent = join.join("parent", JoinType.LEFT);
            return cb.or(
                    cb.equal(join.get("slug"), categorySlug),
                    cb.equal(parent.get("slug"), categorySlug)
            );
        };
    }

    public static Specification<Product> hasBrandSlugs(List<String> brandSlugs) {
        if (isEmpty(brandSlugs)) {
            return null;
        }
        return (root, query, cb) -> root.join("brand", JoinType.INNER).get("slug").in(brandSlugs);
    }

    public static Specification<Product> hasFlavours(List<String> flavours) {
        if (isEmpty(flavours)) {
            return null;
        }
        List<String> lowered = flavours.stream().map(String::toLowerCase).toList();
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Product, ProductVariant> variant = root.join("variants", JoinType.INNER);
            return cb.and(
                    cb.isTrue(variant.get("active")),
                    cb.lower(variant.get("flavour")).in(lowered)
            );
        };
    }

    public static Specification<Product> hasSizeLabels(List<String> sizeLabels) {
        if (isEmpty(sizeLabels)) {
            return null;
        }
        List<String> lowered = sizeLabels.stream().map(String::toLowerCase).toList();
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Product, ProductVariant> variant = root.join("variants", JoinType.INNER);
            return cb.and(
                    cb.isTrue(variant.get("active")),
                    cb.lower(variant.get("sizeLabel")).in(lowered)
            );
        };
    }

    /**
     * Price now lives on the variant, so a product matches when any active
     * variant of it falls in range — which is what "under ₹2000" means to a
     * shopper looking at a "from ₹X" card.
     */
    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        if (min == null && max == null) {
            return null;
        }
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Product, ProductVariant> variant = root.join("variants", JoinType.INNER);
            Expression<BigDecimal> effectivePrice = cb.coalesce(
                    variant.<BigDecimal>get("salePrice"), variant.<BigDecimal>get("price"));
            if (min != null && max != null) {
                return cb.and(cb.isTrue(variant.get("active")), cb.between(effectivePrice, min, max));
            } else if (min != null) {
                return cb.and(cb.isTrue(variant.get("active")), cb.greaterThanOrEqualTo(effectivePrice, min));
            } else {
                return cb.and(cb.isTrue(variant.get("active")), cb.lessThanOrEqualTo(effectivePrice, max));
            }
        };
    }

    /** At least one active variant with stock left. */
    public static Specification<Product> inStockOnly(boolean enabled) {
        if (!enabled) {
            return null;
        }
        return (root, query, cb) -> {
            Subquery<Long> sub = query.subquery(Long.class);
            var variant = sub.from(ProductVariant.class);
            var inventory = variant.join("inventory", JoinType.INNER);
            sub.select(cb.literal(1L)).where(
                    cb.equal(variant.get("product"), root),
                    cb.isTrue(variant.get("active")),
                    cb.greaterThan(inventory.<Integer>get("stockQuantity"), 0)
            );
            return cb.exists(sub);
        };
    }

    public static Specification<Product> minRating(Double rating) {
        if (rating == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<BigDecimal>get("avgRating"), BigDecimal.valueOf(rating));
    }

    public static Specification<Product> isFeatured() {
        return (root, query, cb) -> cb.isTrue(root.get("featured"));
    }

    public static Specification<Product> isBestSeller() {
        return (root, query, cb) -> cb.isTrue(root.get("bestSeller"));
    }

    public static Specification<Product> isNewArrival() {
        return (root, query, cb) -> cb.isTrue(root.get("newArrival"));
    }

    /**
     * Orders on the cheapest active variant rather than a plain column, since that
     * is the price the card shows. Callers must pass Sort.unsorted() to the Pageable
     * so Spring Data does not also append its own ORDER BY.
     */
    public static Specification<Product> orderByEffectivePrice(boolean ascending) {
        return (root, query, cb) -> {
            Subquery<BigDecimal> sub = query.subquery(BigDecimal.class);
            var variant = sub.from(ProductVariant.class);
            sub.select(cb.min(cb.coalesce(variant.<BigDecimal>get("salePrice"), variant.<BigDecimal>get("price"))))
                    .where(cb.equal(variant.get("product"), root), cb.isTrue(variant.get("active")));
            query.orderBy(ascending ? cb.asc(sub) : cb.desc(sub));
            return cb.conjunction();
        };
    }
}
