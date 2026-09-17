package com.vitalora.api.service;

import com.vitalora.api.dto.cms.BannerRequest;
import com.vitalora.api.dto.cms.BannerResponse;
import com.vitalora.api.dto.cms.CommerceSettings;

import java.util.List;
import java.util.Map;

public interface CmsService {
    Map<String, Object> getPage(String pageKey);

    /** Shipping/delivery rules from the "site" page, falling back to defaults. */
    CommerceSettings getCommerceSettings();

    Map<String, Object> updatePage(String pageKey, Map<String, Object> sections);

    List<BannerResponse> getActiveBanners();

    List<BannerResponse> getAllBannersForAdmin();

    BannerResponse createBanner(BannerRequest request);

    BannerResponse updateBanner(Long id, BannerRequest request);

    void deleteBanner(Long id);

    BannerResponse updateBannerStatus(Long id, boolean active);
}
