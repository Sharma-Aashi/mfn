package com.vitalora.api.service.impl;

import com.vitalora.api.config.AppProperties;
import com.vitalora.api.dto.auth.*;
import com.vitalora.api.entity.*;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.DuplicateResourceException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.repository.*;
import com.vitalora.api.security.JwtService;
import com.vitalora.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }

        Role customerRole = roleRepository.findByName(Role.RoleName.CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role is not seeded"));

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(customerRole)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        cartRepository.save(Cart.builder().user(user).build());
        wishlistRepository.save(Wishlist.builder().user(user).build());

        String token = jwtService.generateToken(user.getId(), user.getEmail(), customerRole.getName().name());
        return AuthResponse.of(token, toUserResponse(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        return authenticate(request, null);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse adminLogin(LoginRequest request) {
        return authenticate(request, Role.RoleName.ADMIN);
    }

    private AuthResponse authenticate(LoginRequest request, Role.RoleName requiredRole) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        if (!user.isEnabled()) {
            throw new BadRequestException("This account has been disabled.");
        }
        if (requiredRole != null && user.getRole().getName() != requiredRole) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().getName().name());
        return AuthResponse.of(token, toUserResponse(user));
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(user -> {
            byte[] randomBytes = new byte[32];
            SECURE_RANDOM.nextBytes(randomBytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                    .used(false)
                    .build();
            resetTokenRepository.save(resetToken);

            String resetLink = appProperties.getFrontend().getBaseUrl() + "/account/reset-password?token=" + token;
            log.info("Password reset requested for {}. Reset link (would be emailed in production): {}",
                    user.getEmail(), resetLink);
        });
        // Always return silently (no user enumeration) regardless of whether the email exists.
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("This reset link is invalid or has expired."));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new BadRequestException("This reset link is invalid or has expired.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        return toUserResponse(findUser(userId));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        return toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
                user.getRole().getName().name());
    }
}
