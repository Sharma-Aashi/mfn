package com.vitalora.api.service.impl;

import com.vitalora.api.dto.wishlist.WishlistItemResponse;
import com.vitalora.api.dto.wishlist.WishlistResponse;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.User;
import com.vitalora.api.entity.Wishlist;
import com.vitalora.api.entity.WishlistItem;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.ProductRepository;
import com.vitalora.api.repository.UserRepository;
import com.vitalora.api.repository.WishlistItemRepository;
import com.vitalora.api.repository.WishlistRepository;
import com.vitalora.api.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WishlistResponse getWishlist(Long userId) {
        return toResponse(findOrCreate(userId));
    }

    @Override
    @Transactional
    public WishlistResponse addItem(Long userId, Long productId) {
        Wishlist wishlist = findOrCreate(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));

        if (wishlistItemRepository.findByWishlistIdAndProductId(wishlist.getId(), productId).isEmpty()) {
            WishlistItem item = WishlistItem.builder().wishlist(wishlist).product(product).build();
            wishlist.getItems().add(item);
            wishlistItemRepository.save(item);
        }
        return toResponse(wishlistRepository.findByUserId(userId).orElseThrow());
    }

    @Override
    @Transactional
    public WishlistResponse removeItem(Long userId, Long productId) {
        Wishlist wishlist = findOrCreate(userId);
        WishlistItem item = wishlistItemRepository.findByWishlistIdAndProductId(wishlist.getId(), productId)
                .orElseThrow(() -> new BadRequestException("This product is not in your wishlist."));
        wishlist.getItems().remove(item);
        wishlistItemRepository.delete(item);
        return toResponse(wishlistRepository.findByUserId(userId).orElseThrow());
    }

    private Wishlist findOrCreate(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
            return wishlistRepository.save(Wishlist.builder().user(user).build());
        });
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        return new WishlistResponse(wishlist.getItems().stream().map(this::toItemResponse).toList());
    }

    private WishlistItemResponse toItemResponse(WishlistItem item) {
        Product product = item.getProduct();
        boolean inStock = product.isActive() && ProductMapper.isInStock(product);
        var defaultVariant = product.getDefaultVariant();
        long activeVariants = product.getVariants().stream().filter(v -> v.isActive()).count();
        return new WishlistItemResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                ProductMapper.primaryImageUrl(product),
                product.getBrand() != null ? product.getBrand().getName() : null,
                product.getPrice(),
                product.getSalePrice(),
                product.getFromPrice(),
                defaultVariant != null ? defaultVariant.getId() : null,
                activeVariants > 1,
                inStock,
                item.getCreatedAt()
        );
    }
}
