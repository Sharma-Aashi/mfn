package com.vitalora.api.specification;

import com.vitalora.api.entity.Category;
import com.vitalora.api.entity.Product;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class ProductSpecification {

    private ProductSpecification() {
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
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("shortDescription")), like),
                    cb.like(cb.lower(root.get("tags")), like)
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

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        if (min == null && max == null) {
            return null;
        }
        return (root, query, cb) -> {
            Expression<BigDecimal> effectivePrice = cb.coalesce(
                    root.<BigDecimal>get("salePrice"), root.<BigDecimal>get("price"));
            if (min != null && max != null) {
                return cb.between(effectivePrice, min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(effectivePrice, min);
            } else {
                return cb.lessThanOrEqualTo(effectivePrice, max);
            }
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
     * Orders directly on the query rather than via Pageable's Sort, since "effective price"
     * is a coalesce(sale_price, price) expression rather than a plain column. Callers must
     * pass Sort.unsorted() to the Pageable so Spring Data does not also append its own ORDER BY.
     */
    public static Specification<Product> orderByEffectivePrice(boolean ascending) {
        return (root, query, cb) -> {
            Expression<BigDecimal> effectivePrice = cb.coalesce(
                    root.<BigDecimal>get("salePrice"), root.<BigDecimal>get("price"));
            query.orderBy(ascending ? cb.asc(effectivePrice) : cb.desc(effectivePrice));
            return cb.conjunction();
        };
    }
}
