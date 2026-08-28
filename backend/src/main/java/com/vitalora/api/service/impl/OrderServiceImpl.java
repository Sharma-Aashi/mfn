package com.vitalora.api.service.impl;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.order.CreateOrderRequest;
import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.entity.*;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.OrderMapper;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.*;
import com.vitalora.api.service.OrderService;
import com.vitalora.api.util.OrderNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999.00");
    private static final BigDecimal STANDARD_SHIPPING_FEE = new BigDecimal("79.00");
    private static final int ESTIMATED_DELIVERY_DAYS = 5;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(Long userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.of(orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable), OrderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long id) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", id));
        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderNumber));
        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Your cart is empty."));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int availableStock = product.getInventory() != null ? product.getInventory().getStockQuantity() : 0;

            if (!product.isActive()) {
                throw new BadRequestException("\"" + product.getName() + "\" is no longer available. Please remove it from your cart.");
            }
            if (cartItem.getQuantity() > availableStock) {
                throw new BadRequestException("Only " + availableStock + " unit(s) of \"" + product.getName() +
                        "\" left in stock. Please update your cart.");
            }

            BigDecimal unitPrice = product.getEffectivePrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .productImage(ProductMapper.primaryImageUrl(product))
                    .sku(product.getSku())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .build());

            product.getInventory().setStockQuantity(availableStock - cartItem.getQuantity());
        }

        BigDecimal shippingAmount = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : STANDARD_SHIPPING_FEE;
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.subtract(discountAmount).add(shippingAmount).add(taxAmount);

        String orderNumber = OrderNumberGenerator.generate(orderRepository::existsByOrderNumber);

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .customerFullName(request.customerFullName())
                .customerEmail(request.customerEmail())
                .customerPhone(request.customerPhone())
                .shippingAddressLine1(request.shippingAddressLine1())
                .shippingAddressLine2(request.shippingAddressLine2())
                .shippingCity(request.shippingCity())
                .shippingState(request.shippingState())
                .shippingPostalCode(request.shippingPostalCode())
                .shippingCountry(request.shippingCountry() != null && !request.shippingCountry().isBlank()
                        ? request.shippingCountry() : "India")
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingAmount(shippingAmount)
                .taxAmount(taxAmount)
                .grandTotal(grandTotal)
                .paymentMethod("COD")
                .estimatedDeliveryDate(LocalDate.now().plusDays(ESTIMATED_DELIVERY_DAYS))
                .customerNotes(request.customerNotes())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Payment payment = Payment.builder()
                .order(order)
                .method("COD")
                .status(Payment.PaymentStatus.PENDING)
                .amount(grandTotal)
                .build();
        order.setPayment(payment);

        order = orderRepository.save(order);

        if (Boolean.TRUE.equals(request.saveAddress())) {
            boolean isFirstAddress = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).isEmpty();
            addressRepository.save(Address.builder()
                    .user(user)
                    .fullName(request.customerFullName())
                    .phone(request.customerPhone())
                    .addressLine1(request.shippingAddressLine1())
                    .addressLine2(request.shippingAddressLine2())
                    .city(request.shippingCity())
                    .state(request.shippingState())
                    .postalCode(request.shippingPostalCode())
                    .country(request.shippingCountry() != null && !request.shippingCountry().isBlank()
                            ? request.shippingCountry() : "India")
                    .isDefault(isFirstAddress)
                    .build());
        }

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        return OrderMapper.toResponse(order);
    }
}
