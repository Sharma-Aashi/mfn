package com.vitalora.api.controller;

import com.vitalora.api.dto.common.MessageResponse;
import com.vitalora.api.dto.common.StatusUpdateRequest;
import com.vitalora.api.dto.faq.FaqReorderRequest;
import com.vitalora.api.dto.faq.FaqRequest;
import com.vitalora.api.dto.faq.FaqResponse;
import com.vitalora.api.service.FaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @GetMapping("/api/faqs")
    public ResponseEntity<List<FaqResponse>> getActive(@RequestParam(required = false) String category,
                                                          @RequestParam(required = false) String search) {
        return ResponseEntity.ok(faqService.getActive(category, search));
    }

    @GetMapping("/api/admin/faqs")
    public ResponseEntity<List<FaqResponse>> getAllForAdmin() {
        return ResponseEntity.ok(faqService.getAllForAdmin());
    }

    @PostMapping("/api/admin/faqs")
    public ResponseEntity<FaqResponse> create(@Valid @RequestBody FaqRequest request) {
        return ResponseEntity.ok(faqService.create(request));
    }

    @PutMapping("/api/admin/faqs/{id}")
    public ResponseEntity<FaqResponse> update(@PathVariable Long id, @Valid @RequestBody FaqRequest request) {
        return ResponseEntity.ok(faqService.update(id, request));
    }

    @DeleteMapping("/api/admin/faqs/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        faqService.delete(id);
        return ResponseEntity.ok(new MessageResponse("FAQ deleted."));
    }

    @PatchMapping("/api/admin/faqs/{id}/status")
    public ResponseEntity<FaqResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(faqService.updateStatus(id, request.active()));
    }

    @PutMapping("/api/admin/faqs/reorder")
    public ResponseEntity<MessageResponse> reorder(@Valid @RequestBody FaqReorderRequest request) {
        faqService.reorder(request);
        return ResponseEntity.ok(new MessageResponse("FAQ order updated."));
    }
}
