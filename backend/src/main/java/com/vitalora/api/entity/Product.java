package com.vitalora.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(nullable = false, unique = true, length = 60)
    private String sku;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "nutritional_info", columnDefinition = "TEXT")
    private String nutritionalInfo;

    @Column(name = "usage_instructions", columnDefinition = "TEXT")
    private String usageInstructions;

    @Column(columnDefinition = "TEXT")
    private String warnings;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(name = "is_best_seller", nullable = false)
    @Builder.Default
    private boolean bestSeller = false;

    @Column(name = "is_new_arrival", nullable = false)
    @Builder.Default
    private boolean newArrival = false;

    @Column(name = "avg_rating", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private int reviewCount = 0;

    @Column(length = 500)
    private String tags;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    /**
     * Stock and the real selling price live here, not on the product.
     * A Set rather than a List so it can be fetched in the same entity graph
     * as {@code images} without tripping Hibernate's MultipleBagFetchException.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ProductVariant> variants = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "product_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    /**
     * The product's own base price. It seeds new variants and is the fallback
     * for a product that has none; what a customer pays always comes from a
     * variant, so prefer {@link #getFromPrice()} for display.
     */
    public BigDecimal getEffectivePrice() {
        return (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) > 0) ? salePrice : price;
    }

    /** The cheapest active variant's price — the "from ₹X" a listing card shows. */
    public BigDecimal getFromPrice() {
        return variants.stream()
                .filter(ProductVariant::isActive)
                .map(ProductVariant::getEffectivePrice)
                .min(BigDecimal::compareTo)
                .orElseGet(this::getEffectivePrice);
    }

    /** The variant a product page opens on: the flagged default, else the first active one. */
    public ProductVariant getDefaultVariant() {
        return variants.stream()
                .filter(ProductVariant::isActive)
                .filter(ProductVariant::isDefaultVariant)
                .findFirst()
                .orElseGet(() -> variants.stream()
                        .filter(ProductVariant::isActive)
                        .findFirst()
                        .orElse(null));
    }

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }

    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }
}
