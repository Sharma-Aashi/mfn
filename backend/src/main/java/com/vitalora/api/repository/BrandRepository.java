package com.vitalora.api.repository;

import com.vitalora.api.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findBySlug(String slug);

    Optional<Brand> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Brand> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    List<Brand> findByActiveTrueAndFeaturedTrueOrderByDisplayOrderAscNameAsc();

    List<Brand> findAllByOrderByDisplayOrderAscNameAsc();

    long countByHouseBrandTrue();
}
