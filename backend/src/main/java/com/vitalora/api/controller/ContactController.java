package com.vitalora.api.controller;

import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.contact.ContactMessageRequest;
import com.vitalora.api.dto.contact.ContactMessageResponse;
import com.vitalora.api.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/api/contact")
    public ResponseEntity<MessageResponse> submit(@Valid @RequestBody ContactMessageRequest request) {
        contactService.submit(request);
        return ResponseEntity.ok(new MessageResponse(
                "Thanks for reaching out. Our team will get back to you shortly."));
    }

    @GetMapping("/api/admin/contact-messages")
    public ResponseEntity<PageResponse<ContactMessageResponse>> getAllForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(contactService.getAllForAdmin(page, size));
    }

    @PatchMapping("/api/admin/contact-messages/{id}/read")
    public ResponseEntity<ContactMessageResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markRead(id));
    }

    @DeleteMapping("/api/admin/contact-messages/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Message deleted."));
    }
}
