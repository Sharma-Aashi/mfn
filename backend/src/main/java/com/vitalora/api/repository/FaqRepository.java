package com.vitalora.api.repository;

import com.vitalora.api.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findByActiveTrueOrderByDisplayOrderAsc();
    List<Faq> findByActiveTrueAndCategoryOrderByDisplayOrderAsc(Faq.FaqCategory category);
    List<Faq> findAllByOrderByCategoryAscDisplayOrderAsc();
}
