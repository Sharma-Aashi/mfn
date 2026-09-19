package com.vitalora.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * The sellable unit: one flavour/size combination of a product, with its own
 * SKU, price and stock. Carts and orders reference a variant, never a product.
 */
@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 60)
    private String sku;

    @Column(length = 80)
    private String flavour;

    /** What the size selector shows: "1 kg", "2 lb", "60 caps". */
    @Column(name = "size_label", length = 60)
    private String sizeLabel;

    /** The same size as a number, so sorting and range filters need no label parsing. */
    @Column(name = "size_value", precision = 10, scale = 3)
    private BigDecimal sizeValue;

    @Column(name = "size_unit", length = 20)
    private String sizeUnit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    /** The variant preselected on the product page. At most one per product. */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean defaultVariant = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToOne(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Inventory inventory;

    public BigDecimal getEffectivePrice() {
        return (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) > 0) ? salePrice : price;
    }

    /** "Chocolate · 1 kg", or whichever half exists. Null when the variant is unnamed. */
    public String getLabel() {
        boolean hasFlavour = flavour != null && !flavour.isBlank();
        boolean hasSize = sizeLabel != null && !sizeLabel.isBlank();
        if (hasFlavour && hasSize) {
            return flavour + " · " + sizeLabel;
        }
        if (hasFlavour) {
            return flavour;
        }
        return hasSize ? sizeLabel : null;
    }
}
