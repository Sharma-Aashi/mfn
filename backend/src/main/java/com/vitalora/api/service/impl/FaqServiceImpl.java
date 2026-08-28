package com.vitalora.api.service.impl;

import com.vitalora.api.dto.faq.FaqReorderRequest;
import com.vitalora.api.dto.faq.FaqRequest;
import com.vitalora.api.dto.faq.FaqResponse;
import com.vitalora.api.entity.Faq;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.FaqMapper;
import com.vitalora.api.repository.FaqRepository;
import com.vitalora.api.service.FaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqServiceImpl implements FaqService {

    private final FaqRepository faqRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FaqResponse> getActive(String category, String search) {
        List<Faq> faqs;
        if (category != null && !category.isBlank()) {
            faqs = faqRepository.findByActiveTrueAndCategoryOrderByDisplayOrderAsc(parseCategory(category));
        } else {
            faqs = faqRepository.findByActiveTrueOrderByDisplayOrderAsc();
        }

        if (search != null && !search.isBlank()) {
            String needle = search.trim().toLowerCase();
            faqs = faqs.stream()
                    .filter(f -> f.getQuestion().toLowerCase().contains(needle)
                            || f.getAnswer().toLowerCase().contains(needle))
                    .toList();
        }

        return faqs.stream().map(FaqMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FaqResponse> getAllForAdmin() {
        return faqRepository.findAllByOrderByCategoryAscDisplayOrderAsc().stream()
                .map(FaqMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FaqResponse create(FaqRequest request) {
        Integer maxOrder = faqRepository.findAllByOrderByCategoryAscDisplayOrderAsc().stream()
                .map(Faq::getDisplayOrder).max(Integer::compareTo).orElse(-1);

        Faq faq = Faq.builder()
                .question(request.question())
                .answer(request.answer())
                .category(parseCategory(request.category()))
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : maxOrder + 1)
                .active(request.active() == null || request.active())
                .build();

        return FaqMapper.toResponse(faqRepository.save(faq));
    }

    @Override
    @Transactional
    public FaqResponse update(Long id, FaqRequest request) {
        Faq faq = findEntity(id);
        faq.setQuestion(request.question());
        faq.setAnswer(request.answer());
        faq.setCategory(parseCategory(request.category()));
        if (request.displayOrder() != null) {
            faq.setDisplayOrder(request.displayOrder());
        }
        if (request.active() != null) {
            faq.setActive(request.active());
        }
        return FaqMapper.toResponse(faqRepository.save(faq));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        faqRepository.delete(findEntity(id));
    }

    @Override
    @Transactional
    public FaqResponse updateStatus(Long id, boolean active) {
        Faq faq = findEntity(id);
        faq.setActive(active);
        return FaqMapper.toResponse(faqRepository.save(faq));
    }

    @Override
    @Transactional
    public void reorder(FaqReorderRequest request) {
        List<Faq> faqs = faqRepository.findAllById(request.faqIds());
        for (int i = 0; i < request.faqIds().size(); i++) {
            final int order = i;
            Long id = request.faqIds().get(i);
            faqs.stream().filter(f -> f.getId().equals(id)).findFirst()
                    .ifPresent(f -> f.setDisplayOrder(order));
        }
        faqRepository.saveAll(faqs);
    }

    private Faq.FaqCategory parseCategory(String category) {
        try {
            return Faq.FaqCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid FAQ category: " + category);
        }
    }

    private Faq findEntity(Long id) {
        return faqRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("FAQ", id));
    }
}
