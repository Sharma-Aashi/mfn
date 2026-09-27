package com.vitalora.api.repository;

import com.vitalora.api.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"images", "categories", "brand", "variants", "variants.inventory"})
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query("select distinct p from Product p join p.categories c " +
            "where c.id in :categoryIds and p.active = true and p.id <> :excludeId")
    List<Product> findRelated(Long excludeId, List<Long> categoryIds);

    /** Direct assignments only. Used to decide whether a category may be deleted. */
    long countByCategories_Id(Long categoryId);

    /**
     * Products in the category or in any of its children. A parent holds no
     * direct assignments, so this is the number to show next to it - a parent
     * reading "0" that returns results when clicked looks broken.
     */
    @Query("select count(distinct p) from Product p join p.categories c " +
            "where p.active = true and (c.id = :categoryId or c.parent.id = :categoryId)")
    long countInCategoryTree(@Param("categoryId") Long categoryId);

    long countByBrandId(Long brandId);

    /** What a shopper would actually find under this brand. */
    long countByBrandIdAndActiveTrue(Long brandId);

    @EntityGraph(attributePaths = {"images", "categories", "brand", "variants", "variants.inventory"})
    List<Product> findTop8ByActiveTrueAndFeaturedTrue();

    /**
     * Stacks for the home page. The entity graph pulls the components in with
     * them, because a stack card is useless without the packs it contains and
     * fetching those lazily would be one query per combo.
     */
    // The component products' own images are deliberately NOT in this graph:
    // "images" would then appear twice and Hibernate rejects fetching the same
    // bag twice. They load lazily inside the read transaction instead, which
    // is a handful of queries for at most four stacks.
    @EntityGraph(attributePaths = {
            "images", "brand", "variants", "variants.inventory",
            "comboItems", "comboItems.variant", "comboItems.variant.product"
    })
    List<Product> findTop4ByActiveTrueAndComboTrueOrderByIdDesc();
}
