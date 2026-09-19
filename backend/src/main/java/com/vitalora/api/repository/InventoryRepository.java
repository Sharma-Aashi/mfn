package com.vitalora.api.repository;

import com.vitalora.api.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantId(Long variantId);

    @Query("select i from Inventory i where i.stockQuantity <= i.lowStockThreshold")
    List<Inventory> findLowStock();

    /** Total stock across every variant of a product — what a listing card's "in stock" means. */
    @Query("select coalesce(sum(i.stockQuantity), 0) from Inventory i where i.variant.product.id = :productId")
    long totalStockForProduct(@Param("productId") Long productId);

    // q is always a non-null pattern (empty string when the caller has no search term) so that
    // Postgres never has to infer the type of a bare NULL parameter bound inside concat()/lower() -
    // in practice that inference has been observed to resolve to bytea and blow up with
    // "function lower(bytea) does not exist".
    @EntityGraph(attributePaths = {"variant", "variant.product", "variant.product.images", "variant.product.brand"})
    @Query("select i from Inventory i join i.variant v join v.product p where " +
            "(lower(p.name) like lower(concat('%', :q, '%')) " +
            " or lower(v.sku) like lower(concat('%', :q, '%')) " +
            " or lower(coalesce(v.flavour, '')) like lower(concat('%', :q, '%'))) " +
            "and (:lowOnly = false or i.stockQuantity <= i.lowStockThreshold)")
    Page<Inventory> search(@Param("q") String q, @Param("lowOnly") boolean lowOnly, Pageable pageable);
}
