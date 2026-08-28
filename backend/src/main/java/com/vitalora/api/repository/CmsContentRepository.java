package com.vitalora.api.repository;

import com.vitalora.api.entity.CmsContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CmsContentRepository extends JpaRepository<CmsContent, Long> {
    List<CmsContent> findByPageKey(String pageKey);
    Optional<CmsContent> findByPageKeyAndSectionKey(String pageKey, String sectionKey);
}
