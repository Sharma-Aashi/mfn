package com.vitalora.api.controller;

import com.vitalora.api.dto.category.CategoryRequest;
import com.vitalora.api.dto.category.CategoryResponse;
import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.StatusUpdateRequest;
import com.vitalora.api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllActive() {
        return ResponseEntity.ok(categoryService.getAllActive());
    }

    @GetMapping("/admin")
    public ResponseEntity<List<CategoryResponse>> getAllForAdmin() {
        return ResponseEntity.ok(categoryService.getAllForAdmin());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CategoryResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Category deleted."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CategoryResponse> updateStatus(@PathVariable Long id,
                                                           @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(categoryService.updateStatus(id, request.active()));
    }

    @PostMapping(value = "/{id}/image", consumes = "multipart/form-data")
    public ResponseEntity<CategoryResponse> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(categoryService.uploadImage(id, file));
    }
}
