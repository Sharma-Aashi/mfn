package com.vitalora.api.service.impl;

import com.vitalora.api.dto.cart.*;
import com.vitalora.api.entity.Cart;
import com.vitalora.api.entity.CartItem;
import com.vitalora.api.entity.Product;
import com.vitalora.api.entity.User;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.CartItemRepository;
import com.vitalora.api.repository.CartRepository;
import com.vitalora.api.repository.ProductRepository;
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
    private final ProductRepository productRepository;
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
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> ResourceNotFoundException.of("Product", request.productId()));

        if (!product.isActive()) {
            throw new BadRequestException("This product is currently unavailable.");
        }

        int availableStock = product.getInventory() != null ? product.getInventory().getStockQuantity() : 0;

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId()).orElse(null);
        int desiredQuantity = (item != null ? item.getQuantity() : 0) + request.quantity();
        if (desiredQuantity > availableStock) {
            throw new BadRequestException("Only " + availableStock + " unit(s) of \"" + product.getName() + "\" available.");
        }

        if (item != null) {
            item.setQuantity(desiredQuantity);
        } else {
            item = CartItem.builder().cart(cart).product(product).quantity(request.quantity()).build();
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

        int availableStock = item.getProduct().getInventory() != null
                ? item.getProduct().getInventory().getStockQuantity() : 0;
        if (request.quantity() > availableStock) {
            throw new BadRequestException("Only " + availableStock + " unit(s) of \"" + item.getProduct().getName() + "\" available.");
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
        Product product = item.getProduct();
        BigDecimal unitPrice = product.getEffectivePrice();
        int availableStock = product.getInventory() != null ? product.getInventory().getStockQuantity() : 0;
        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                ProductMapper.primaryImageUrl(product),
                unitPrice,
                item.getQuantity(),
                unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())),
                product.isActive() && availableStock > 0,
                availableStock
        );
    }
}
