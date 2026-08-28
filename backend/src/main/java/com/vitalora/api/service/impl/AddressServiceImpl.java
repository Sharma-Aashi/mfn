package com.vitalora.api.service.impl;

import com.vitalora.api.dto.address.AddressRequest;
import com.vitalora.api.dto.address.AddressResponse;
import com.vitalora.api.entity.Address;
import com.vitalora.api.entity.User;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.AddressMapper;
import com.vitalora.api.repository.AddressRepository;
import com.vitalora.api.repository.UserRepository;
import com.vitalora.api.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAll(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse create(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        boolean noExistingAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).isEmpty();
        boolean makeDefault = Boolean.TRUE.equals(request.isDefault()) || noExistingAddresses;

        if (makeDefault) {
            clearExistingDefault(userId);
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.fullName())
                .phone(request.phone())
                .addressLine1(request.addressLine1())
                .addressLine2(request.addressLine2())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .country(request.country() != null && !request.country().isBlank() ? request.country() : "India")
                .isDefault(makeDefault)
                .build();

        return AddressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse update(Long userId, Long id, AddressRequest request) {
        Address address = findOwned(userId, id);

        if (Boolean.TRUE.equals(request.isDefault()) && !address.isDefault()) {
            clearExistingDefault(userId);
            address.setDefault(true);
        }

        address.setFullName(request.fullName());
        address.setPhone(request.phone());
        address.setAddressLine1(request.addressLine1());
        address.setAddressLine2(request.addressLine2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPostalCode(request.postalCode());
        if (request.country() != null && !request.country().isBlank()) {
            address.setCountry(request.country());
        }

        return AddressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        Address address = findOwned(userId, id);
        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setDefault(true);
                        addressRepository.save(next);
                    });
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefault(Long userId, Long id) {
        Address address = findOwned(userId, id);
        clearExistingDefault(userId);
        address.setDefault(true);
        return AddressMapper.toResponse(addressRepository.save(address));
    }

    private void clearExistingDefault(Long userId) {
        addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .filter(Address::isDefault)
                .forEach(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private Address findOwned(Long userId, Long id) {
        return addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Address", id));
    }
}
