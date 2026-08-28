package com.vitalora.api.config;

import com.vitalora.api.entity.Cart;
import com.vitalora.api.entity.Role;
import com.vitalora.api.entity.User;
import com.vitalora.api.entity.Wishlist;
import com.vitalora.api.repository.CartRepository;
import com.vitalora.api.repository.RoleRepository;
import com.vitalora.api.repository.UserRepository;
import com.vitalora.api.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures the ADMIN/CUSTOMER roles and a default admin account exist on startup.
 * Kept in Java (rather than the Flyway seed migration) so the password is hashed with the
 * live BCryptPasswordEncoder bean and honours the ADMIN_DEFAULT_EMAIL/PASSWORD env vars.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @Override
    @Transactional
    public void run(String... args) {
        Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleName.ADMIN).build()));
        roleRepository.findByName(Role.RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.RoleName.CUSTOMER).build()));

        String adminEmail = appProperties.getAdmin().getSeedEmail();
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }

        User admin = User.builder()
                .fullName("VITALORA Admin")
                .email(adminEmail.toLowerCase())
                .passwordHash(passwordEncoder.encode(appProperties.getAdmin().getSeedPassword()))
                .role(adminRole)
                .enabled(true)
                .build();
        admin = userRepository.save(admin);

        cartRepository.save(Cart.builder().user(admin).build());
        wishlistRepository.save(Wishlist.builder().user(admin).build());

        log.info("Seeded default admin account: {}", adminEmail);
    }
}
