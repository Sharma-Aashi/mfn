package com.vitalora.api.service;

import com.vitalora.api.dto.cms.BannerRequest;
import com.vitalora.api.dto.cms.BannerResponse;

import java.util.List;
import java.util.Map;

public interface CmsService {
    Map<String, Object> getPage(String pageKey);

    Map<String, Object> updatePage(String pageKey, Map<String, Object> sections);

    List<BannerResponse> getActiveBanners();

    List<BannerResponse> getAllBannersForAdmin();

    BannerResponse createBanner(BannerRequest request);

    BannerResponse updateBanner(Long id, BannerRequest request);

    void deleteBanner(Long id);

    BannerResponse updateBannerStatus(Long id, boolean active);
}
