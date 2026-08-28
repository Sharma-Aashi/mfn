package com.vitalora.api.controller;

import com.vitalora.api.dto.cms.BannerRequest;
import com.vitalora.api.dto.cms.BannerResponse;
import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.StatusUpdateRequest;
import com.vitalora.api.service.CmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CmsController {

    private final CmsService cmsService;

    @GetMapping("/api/cms/banners")
    public ResponseEntity<List<BannerResponse>> getActiveBanners() {
        return ResponseEntity.ok(cmsService.getActiveBanners());
    }

    @GetMapping("/api/cms/{pageKey}")
    public ResponseEntity<Map<String, Object>> getPage(@PathVariable String pageKey) {
        return ResponseEntity.ok(cmsService.getPage(pageKey));
    }

    @PutMapping("/api/cms/{pageKey}")
    public ResponseEntity<Map<String, Object>> updatePage(@PathVariable String pageKey,
                                                             @RequestBody Map<String, Object> sections) {
        return ResponseEntity.ok(cmsService.updatePage(pageKey, sections));
    }

    @GetMapping("/api/admin/banners")
    public ResponseEntity<List<BannerResponse>> getAllBannersForAdmin() {
        return ResponseEntity.ok(cmsService.getAllBannersForAdmin());
    }

    @PostMapping("/api/admin/banners")
    public ResponseEntity<BannerResponse> createBanner(@Valid @RequestBody BannerRequest request) {
        return ResponseEntity.ok(cmsService.createBanner(request));
    }

    @PutMapping("/api/admin/banners/{id}")
    public ResponseEntity<BannerResponse> updateBanner(@PathVariable Long id, @Valid @RequestBody BannerRequest request) {
        return ResponseEntity.ok(cmsService.updateBanner(id, request));
    }

    @DeleteMapping("/api/admin/banners/{id}")
    public ResponseEntity<MessageResponse> deleteBanner(@PathVariable Long id) {
        cmsService.deleteBanner(id);
        return ResponseEntity.ok(new MessageResponse("Banner deleted."));
    }

    @PatchMapping("/api/admin/banners/{id}/status")
    public ResponseEntity<BannerResponse> updateBannerStatus(@PathVariable Long id,
                                                                @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(cmsService.updateBannerStatus(id, request.active()));
    }
}
