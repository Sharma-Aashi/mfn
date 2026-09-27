package com.vitalora.api.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * One thing inside a stack.
 *
 * <p>A combo is an ordinary product with its own variant, price and stock, so
 * nothing here is sellable on its own — these rows exist only so the card can
 * show the component packs and so the struck-through "was" price can be summed
 * from the components rather than typed in a second time and left to drift.
 */
@Entity
@Table(name = "combo_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The combo product this row belongs to. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** A variant of some other product — the actual tub in the stack. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;
}
