package com.vitalora.api.service.impl;

import com.vitalora.api.dto.cart.*;
import com.vitalora.api.entity.Cart;
import com.vitalora.api.entity.CartItem;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.ProductVariant;
import com.vitalora.api.entity.User;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.CartItemRepository;
import com.vitalora.api.repository.CartRepository;
import com.vitalora.api.repository.ProductVariantRepository;
import com.vitalora.api.repository.UserRepository;
import com.vitalora.api.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartResponse getCart(Long userId) {
        return toResponse(findOrCreateCart(userId));
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        Cart cart = findOrCreateCart(userId);
        ProductVariant variant = variantRepository.findById(request.variantId())
                .orElseThrow(() -> ResourceNotFoundException.of("Variant", request.variantId()));
        Product product = variant.getProduct();

        if (!variant.isActive() || !product.isActive()) {
            throw new BadRequestException("This option is currently unavailable.");
        }

        int availableStock = stockOf(variant);

        CartItem item = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId()).orElse(null);
        int desiredQuantity = (item != null ? item.getQuantity() : 0) + request.quantity();
        if (desiredQuantity > availableStock) {
            throw new BadRequestException(shortfallMessage(variant, availableStock));
        }

        if (item != null) {
            item.setQuantity(desiredQuantity);
        } else {
            item = CartItem.builder().cart(cart).variant(variant).quantity(request.quantity()).build();
            cart.getItems().add(item);
        }
        cartItemRepository.save(item);

        return toResponse(cartRepository.findByUserId(userId).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Cart item", itemId));

        int availableStock = stockOf(item.getVariant());
        if (request.quantity() > availableStock) {
            throw new BadRequestException(shortfallMessage(item.getVariant(), availableStock));
        }

        item.setQuantity(request.quantity());
        cartItemRepository.save(item);

        return toResponse(cartRepository.findByUserId(userId).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Cart item", itemId));
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toResponse(cartRepository.findByUserId(userId).orElseThrow());
    }

    @Override
    @Transactional
    public CartResponse clearCart(Long userId) {
        Cart cart = findOrCreateCart(userId);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse mergeCart(Long userId, CartMergeRequest request) {
        for (AddCartItemRequest item : request.items()) {
            try {
                addItem(userId, item);
            } catch (BadRequestException | ResourceNotFoundException ex) {
                // Skip items that are no longer available/in-stock rather than failing the whole merge.
            }
        }
        return toResponse(findOrCreateCart(userId));
    }

    private static int stockOf(ProductVariant variant) {
        return variant.getInventory() != null ? variant.getInventory().getStockQuantity() : 0;
    }

    /** Product name plus the variant when it is named, so the message says which option ran short. */
    private static String describe(ProductVariant variant) {
        String label = variant.getLabel();
        String name = variant.getProduct().getName();
        return label == null ? name : name + " (" + label + ")";
    }

    private static String shortfallMessage(ProductVariant variant, int availableStock) {
        return "Only " + availableStock + " unit(s) of " + describe(variant) + " available.";
    }

    private Cart findOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
            return cartRepository.save(Cart.builder().user(user).build());
        });
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toItemResponse)
                .toList();
        BigDecimal subtotal = items.stream().map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int itemCount = items.stream().mapToInt(CartItemResponse::quantity).sum();
        return new CartResponse(cart.getId(), items, itemCount, subtotal);
    }

    private CartItemResponse toItemResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        Product product = variant.getProduct();
        BigDecimal unitPrice = variant.getEffectivePrice();
        int availableStock = stockOf(variant);
        String variantImage = variant.getImageUrl();
        String image = (variantImage != null && !variantImage.isBlank())
                ? variantImage
                : ProductMapper.primaryImageUrl(product);
        return new CartItemResponse(
                item.getId(),
                variant.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                image,
                product.getBrand() != null ? product.getBrand().getName() : null,
                variant.getLabel(),
                variant.getSku(),
                unitPrice,
                variant.getPrice(),
                item.getQuantity(),
                unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())),
                product.isActive() && variant.isActive() && availableStock > 0,
                availableStock
        );
    }
}
