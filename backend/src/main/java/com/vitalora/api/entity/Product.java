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

    /**
     * At-a-glance facts. A List (bag) like images, so it is loaded separately
     * rather than joined in the same entity graph.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProductSpec> specs = new ArrayList<>();

    /**
     * True when this product is a stack: several other products sold together
     * at one price. It is still a perfectly ordinary product underneath - its
     * own variant, price and stock - so the cart and checkout need to know
     * nothing about combos.
     */
    @Column(name = "is_combo", nullable = false)
    @Builder.Default
    private boolean combo = false;

    /**
     * What is inside the stack. Empty for everything that is not one.
     *
     * <p>A Set rather than a List for the same reason as {@code variants}: a
     * stack card needs the images and the contents in one query, and two bags
     * in one entity graph is a MultipleBagFetchException. Order comes from
     * displayOrder at the point of display.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ComboItem> comboItems = new LinkedHashSet<>();

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

    public void addSpec(ProductSpec spec) {
        specs.add(spec);
        spec.setProduct(this);
    }

    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }

    public void addComboItem(ComboItem item) {
        comboItems.add(item);
        item.setProduct(this);
    }

    /**
     * What the contents would cost bought separately — the struck-through
     * price on a stack. Summed from the components every time rather than
     * stored, so it cannot disagree with them after a re-price.
     *
     * <p>Zero when the stack is empty, which is also the signal to show no
     * saving at all rather than a 100% one.
     */
    public BigDecimal getComponentsTotal() {
        return comboItems.stream()
                .map(i -> i.getVariant().getEffectivePrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
