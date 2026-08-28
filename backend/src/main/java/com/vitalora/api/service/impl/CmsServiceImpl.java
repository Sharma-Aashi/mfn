package com.vitalora.api.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vitalora.api.dto.cms.BannerRequest;
import com.vitalora.api.dto.cms.BannerResponse;
import com.vitalora.api.entity.Banner;
import com.vitalora.api.entity.CmsContent;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.BannerMapper;
import com.vitalora.api.repository.BannerRepository;
import com.vitalora.api.repository.CmsContentRepository;
import com.vitalora.api.service.CmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CmsServiceImpl implements CmsService {

    private final CmsContentRepository cmsContentRepository;
    private final BannerRepository bannerRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPage(String pageKey) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (CmsContent content : cmsContentRepository.findByPageKey(pageKey)) {
            result.put(content.getSectionKey(), parseJson(content.getContentJson()));
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> updatePage(String pageKey, Map<String, Object> sections) {
        if (sections == null) {
            throw new BadRequestException("Content sections are required.");
        }
        for (Map.Entry<String, Object> entry : sections.entrySet()) {
            CmsContent content = cmsContentRepository.findByPageKeyAndSectionKey(pageKey, entry.getKey())
                    .orElseGet(() -> CmsContent.builder().pageKey(pageKey).sectionKey(entry.getKey()).build());
            content.setContentJson(toJson(entry.getValue()));
            cmsContentRepository.save(content);
        }
        return getPage(pageKey);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(BannerMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getAllBannersForAdmin() {
        return bannerRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .map(BannerMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.title())
                .subtitle(request.subtitle())
                .imageUrl(request.imageUrl())
                .ctaText(request.ctaText())
                .ctaLink(request.ctaLink())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .active(request.active() == null || request.active())
                .build();
        return BannerMapper.toResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        Banner banner = findBanner(id);
        banner.setTitle(request.title());
        banner.setSubtitle(request.subtitle());
        if (request.imageUrl() != null) {
            banner.setImageUrl(request.imageUrl());
        }
        banner.setCtaText(request.ctaText());
        banner.setCtaLink(request.ctaLink());
        if (request.displayOrder() != null) {
            banner.setDisplayOrder(request.displayOrder());
        }
        if (request.active() != null) {
            banner.setActive(request.active());
        }
        return BannerMapper.toResponse(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.delete(findBanner(id));
    }

    @Override
    @Transactional
    public BannerResponse updateBannerStatus(Long id, boolean active) {
        Banner banner = findBanner(id);
        banner.setActive(active);
        return BannerMapper.toResponse(bannerRepository.save(banner));
    }

    private Banner findBanner(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Banner", id));
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Invalid content payload.");
        }
    }

    private Object parseJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Object>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse stored CMS JSON, returning raw string: {}", e.getMessage());
            return json;
        }
    }
}
