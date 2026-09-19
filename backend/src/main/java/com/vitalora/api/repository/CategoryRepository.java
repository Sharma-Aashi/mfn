package com.vitalora.api.repository;

import com.vitalora.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIsNullOrderByDisplayOrderAscNameAsc();

    List<Category> findByParentIdOrderByDisplayOrderAscNameAsc(Long parentId);

    long countByParentId(Long parentId);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
