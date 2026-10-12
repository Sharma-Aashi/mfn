package com.vitalora.api.service.impl;

import com.vitalora.api.dto.cms.CommerceSettings;
import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.order.AdminOrderSummaryResponse;
import com.vitalora.api.dto.order.CreateOrderRequest;
import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.entity.*;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.OrderMapper;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.*;
import com.vitalora.api.service.CmsService;
import com.vitalora.api.service.OrderService;
import com.vitalora.api.util.OrderNumberGenerator;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CmsService cmsService;

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
            ProductVariant variant = cartItem.getVariant();
            Product product = variant.getProduct();
            Inventory inventory = variant.getInventory();
            int availableStock = inventory != null ? inventory.getStockQuantity() : 0;

            String label = variant.getLabel();
            String displayName = label == null ? product.getName() : product.getName() + " (" + label + ")";

            if (!product.isActive() || !variant.isActive()) {
                throw new BadRequestException(displayName + " is no longer available. Please remove it from your cart.");
            }
            if (cartItem.getQuantity() > availableStock) {
                throw new BadRequestException("Only " + availableStock + " unit(s) of " + displayName +
                        " left in stock. Please update your cart.");
            }

            BigDecimal unitPrice = variant.getEffectivePrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            String variantImage = variant.getImageUrl();
            String image = (variantImage != null && !variantImage.isBlank())
                    ? variantImage
                    : ProductMapper.primaryImageUrl(product);

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .productName(product.getName())
                    .variantLabel(label)
                    .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                    .productImage(image)
                    .sku(variant.getSku())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .build());

            inventory.setStockQuantity(availableStock - cartItem.getQuantity());
        }

        CommerceSettings commerce = cmsService.getCommerceSettings();
        BigDecimal shippingAmount = subtotal.compareTo(commerce.freeShippingThreshold()) >= 0
                ? BigDecimal.ZERO
                : commerce.shippingFee();
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
                .paymentMethod(normalisedPaymentMethod(request.paymentMethod()))
                .estimatedDeliveryDate(LocalDate.now().plusDays(commerce.estimatedDeliveryDays()))
                .customerNotes(request.customerNotes())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Payment payment = Payment.builder()
                .order(order)
                .method(normalisedPaymentMethod(request.paymentMethod()))
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

    /** COD when nothing is sent, otherwise the uppercase label we store on the order. */
    private static String normalisedPaymentMethod(String raw) {
        if (raw == null || raw.isBlank()) return "COD";
        String s = raw.trim().toUpperCase();
        return s.equals("ONLINE") || s.equals("COD") ? s : "COD";
    }

    // ---------- Admin ----------

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminOrderSummaryResponse> listForAdmin(String q, String status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Order> spec = adminFilter(q, status);
        return PageResponse.of(orderRepository.findAll(spec, pageable), OrderMapper::toAdminSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getForAdmin(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", id));
        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, String newStatus) {
        Order.OrderStatus next;
        try {
            next = Order.OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unknown order status: " + newStatus);
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", id));
        order.setStatus(next);
        orderRepository.save(order);
        return OrderMapper.toResponse(order);
    }

    /**
     * The list page needs just two filters — a free-text search over order
     * number, customer name, email and phone, and a status facet. Keeping
     * them as a single Specification lets us pass {@code null} for either
     * without the service branching into four separate repository queries.
     */
    private static Specification<Order> adminFilter(String q, String status) {
        return (root, cq, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), like),
                        cb.like(cb.lower(root.get("customerFullName")), like),
                        cb.like(cb.lower(root.get("customerEmail")), like),
                        cb.like(cb.lower(root.get("customerPhone")), like)
                ));
            }
            if (status != null && !status.isBlank()) {
                try {
                    preds.add(cb.equal(root.get("status"), Order.OrderStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {
                    // Bad status filter gets silently dropped — the list still works.
                }
            }
            return cb.and(preds.toArray(new Predicate[0]));
        };
    }
}
