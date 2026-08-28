package com.vitalora.api.controller;

import com.vitalora.api.dto.address.AddressRequest;
import com.vitalora.api.dto.address.AddressResponse;
import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.security.SecurityUserDetails;
import com.vitalora.api.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAll(@AuthenticationPrincipal SecurityUserDetails principal) {
        return ResponseEntity.ok(addressService.getAll(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> create(@AuthenticationPrincipal SecurityUserDetails principal,
                                                     @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> update(@AuthenticationPrincipal SecurityUserDetails principal,
                                                     @PathVariable Long id,
                                                     @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> delete(@AuthenticationPrincipal SecurityUserDetails principal,
                                                    @PathVariable Long id) {
        addressService.delete(principal.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Address deleted."));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefault(@AuthenticationPrincipal SecurityUserDetails principal,
                                                          @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefault(principal.getId(), id));
    }
}
