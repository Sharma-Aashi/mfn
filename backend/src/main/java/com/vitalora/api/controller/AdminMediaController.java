package com.vitalora.api.controller;

import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

/**
 * Generic image upload for CMS-managed content (logo, hero, about, banners),
 * where the image isn't attached to a product or category record.
 */
@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private static final Set<String> ALLOWED_FOLDERS = Set.of("cms", "brand", "banners");

    private final FileStorageService fileStorageService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file,
                                                        @RequestParam(defaultValue = "cms") String folder) {
        if (!ALLOWED_FOLDERS.contains(folder)) {
            throw new BadRequestException("Unsupported upload folder. Allowed: " + ALLOWED_FOLDERS);
        }
        return ResponseEntity.ok(Map.of("url", fileStorageService.store(file, folder)));
    }
}
