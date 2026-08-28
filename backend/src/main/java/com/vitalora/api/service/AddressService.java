package com.vitalora.api.service;

import com.vitalora.api.dto.address.AddressRequest;
import com.vitalora.api.dto.address.AddressResponse;

import java.util.List;

public interface AddressService {
    List<AddressResponse> getAll(Long userId);

    AddressResponse create(Long userId, AddressRequest request);

    AddressResponse update(Long userId, Long id, AddressRequest request);

    void delete(Long userId, Long id);

    AddressResponse setDefault(Long userId, Long id);
}
