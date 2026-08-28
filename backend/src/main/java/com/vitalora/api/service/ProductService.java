package com.vitalora.api.service;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.product.ProductImageOrderRequest;
import com.vitalora.api.dto.product.ProductRequest;
import com.vitalora.api.dto.product.ProductResponse;
import com.vitalora.api.dto.product.ProductSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {

    PageResponse<ProductSummaryResponse> search(String q, String category, BigDecimal minPrice, BigDecimal maxPrice,
                                                 Double minRating, String sort, int page, int size);

    PageResponse<ProductResponse> searchForAdmin(String q, Boolean active, String category, int page, int size, String sort);

    ProductResponse getBySlug(String slug);

    ProductResponse getById(Long id);

    List<ProductSummaryResponse> getFeatured();

    List<ProductSummaryResponse> getBestSellers();

    List<ProductSummaryResponse> getNewArrivals();

    List<ProductSummaryResponse> getRelated(String slug);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    ProductResponse updateStatus(Long id, boolean active);

    void bulkUpdateStatus(List<Long> ids, boolean active);

    ProductResponse addImage(Long productId, MultipartFile file, boolean primary);

    void deleteImage(Long productId, Long imageId);

    ProductResponse reorderImages(Long productId, ProductImageOrderRequest request);
}
