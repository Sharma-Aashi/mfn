package com.vitalora.api.controller;

import com.vitalora.api.dto.brand.BrandRequest;
import com.vitalora.api.dto.brand.BrandResponse;
import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.StatusUpdateRequest;
import com.vitalora.api.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getAllActive() {
        return ResponseEntity.ok(brandService.getAllActive());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<BrandResponse>> getFeatured() {
        return ResponseEntity.ok(brandService.getFeatured());
    }

    @GetMapping("/admin")
    public ResponseEntity<List<BrandResponse>> getAllForAdmin() {
        return ResponseEntity.ok(brandService.getAllForAdmin());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BrandResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(brandService.getBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<BrandResponse> create(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(brandService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> update(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(brandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Brand deleted."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BrandResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(brandService.updateStatus(id, request.active()));
    }

    @PostMapping(value = "/{id}/logo", consumes = "multipart/form-data")
    public ResponseEntity<BrandResponse> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(brandService.uploadLogo(id, file));
    }
}
