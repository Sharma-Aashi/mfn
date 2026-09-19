package com.vitalora.api.repository;

import com.vitalora.api.entity.ProductVariant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @EntityGraph(attributePaths = {"product", "product.images", "product.brand", "inventory"})
    Optional<ProductVariant> findWithProductById(Long id);

    Optional<ProductVariant> findBySku(String sku);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    List<ProductVariant> findByProductIdOrderByDisplayOrderAsc(Long productId);

    /** Distinct flavours across every active variant, for the listing page's facet list. */
    @Query("select distinct v.flavour from ProductVariant v " +
            "where v.active = true and v.flavour is not null and v.flavour <> '' " +
            "order by v.flavour asc")
    List<String> findDistinctFlavours();

    /** Distinct size labels across every active variant, for the listing page's facet list. */
    @Query("select distinct v.sizeLabel from ProductVariant v " +
            "where v.active = true and v.sizeLabel is not null and v.sizeLabel <> '' " +
            "order by v.sizeLabel asc")
    List<String> findDistinctSizeLabels();

    /** Bounds for the price slider, taken from what is actually on sale. */
    @Query("select min(coalesce(v.salePrice, v.price)) from ProductVariant v " +
            "where v.active = true and v.product.active = true")
    BigDecimal findMinEffectivePrice();

    @Query("select max(coalesce(v.salePrice, v.price)) from ProductVariant v " +
            "where v.active = true and v.product.active = true")
    BigDecimal findMaxEffectivePrice();
}
