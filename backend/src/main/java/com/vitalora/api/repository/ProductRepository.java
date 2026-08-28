package com.vitalora.api.repository;

import com.vitalora.api.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"images", "categories", "inventory"})
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);

    @Query("select distinct p from Product p join p.categories c " +
            "where c.id in :categoryIds and p.active = true and p.id <> :excludeId")
    List<Product> findRelated(Long excludeId, List<Long> categoryIds);

    long countByCategories_Id(Long categoryId);

    @EntityGraph(attributePaths = {"images", "categories", "inventory"})
    List<Product> findTop8ByActiveTrueAndFeaturedTrue();
}
