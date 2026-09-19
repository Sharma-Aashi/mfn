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

    @EntityGraph(attributePaths = {"images", "categories", "brand", "variants", "variants.inventory"})
    List<Product> findTop8ByActiveTrueAndFeaturedTrue();
}
