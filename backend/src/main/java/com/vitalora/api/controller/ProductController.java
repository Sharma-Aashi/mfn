package com.vitalora.api.controller;

import com.vitalora.api.dto.common.BulkStatusRequest;
import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.common.StatusUpdateRequest;
import com.vitalora.api.dto.product.*;
import com.vitalora.api.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductSummaryResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> brands,
            @RequestParam(required = false) List<String> flavours,
            @RequestParam(required = false) List<String> sizes,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        ProductFilter filter = new ProductFilter(q, category, brands, flavours, sizes,
                minPrice, maxPrice, minRating, inStockOnly, sort);
        return ResponseEntity.ok(productService.search(filter, page, size));
    }

    /** Drives the listing sidebar: which brands, flavours and sizes are worth offering. */
    @GetMapping("/facets")
    public ResponseEntity<ProductFacetsResponse> facets() {
        return ResponseEntity.ok(productService.getFacets());
    }

    @GetMapping("/admin")
    public ResponseEntity<PageResponse<ProductResponse>> searchForAdmin(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(productService.searchForAdmin(q, active, category, page, size, sort));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductSummaryResponse>> featured() {
        return ResponseEntity.ok(productService.getFeatured());
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<ProductSummaryResponse>> bestSellers() {
        return ResponseEntity.ok(productService.getBestSellers());
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductSummaryResponse>> newArrivals() {
        return ResponseEntity.ok(productService.getNewArrivals());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @GetMapping("/{slug}/related")
    public ResponseEntity<List<ProductSummaryResponse>> related(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getRelated(slug));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductResponse> updateStatus(@PathVariable Long id,
                                                          @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(productService.updateStatus(id, request.active()));
    }

    @PatchMapping("/bulk-status")
    public ResponseEntity<MessageResponse> bulkUpdateStatus(@Valid @RequestBody BulkStatusRequest request) {
        productService.bulkUpdateStatus(request.ids(), request.active());
        return ResponseEntity.ok(new MessageResponse("Updated " + request.ids().size() + " product(s)."));
    }

    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ResponseEntity<ProductResponse> addImage(@PathVariable Long id,
                                                      @RequestParam("file") MultipartFile file,
                                                      @RequestParam(defaultValue = "false") boolean primary) {
        return ResponseEntity.ok(productService.addImage(id, file, primary));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<MessageResponse> deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        productService.deleteImage(id, imageId);
        return ResponseEntity.ok(new MessageResponse("Image removed."));
    }

    @PatchMapping("/{id}/images/{imageId}")
    public ResponseEntity<ProductResponse> updateImage(@PathVariable Long id, @PathVariable Long imageId,
                                                         @Valid @RequestBody ProductImageUpdateRequest request) {
        return ResponseEntity.ok(productService.updateImage(id, imageId, request));
    }

    @PutMapping("/{id}/images/order")
    public ResponseEntity<ProductResponse> reorderImages(@PathVariable Long id,
                                                           @Valid @RequestBody ProductImageOrderRequest request) {
        return ResponseEntity.ok(productService.reorderImages(id, request));
    }
}
