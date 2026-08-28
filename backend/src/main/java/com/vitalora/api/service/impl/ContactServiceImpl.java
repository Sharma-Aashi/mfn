package com.vitalora.api.service.impl;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.contact.ContactMessageRequest;
import com.vitalora.api.dto.contact.ContactMessageResponse;
import com.vitalora.api.entity.ContactMessage;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.repository.ContactMessageRepository;
import com.vitalora.api.service.ContactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactServiceImpl implements ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Override
    @Transactional
    public ContactMessageResponse submit(ContactMessageRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .subject(request.subject())
                .message(request.message())
                .read(false)
                .build();
        message = contactMessageRepository.save(message);
        log.info("New contact message from {} <{}>: {}", request.name(), request.email(), request.subject());
        return toResponse(message);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContactMessageResponse> getAllForAdmin(int page, int size) {
        return PageResponse.of(
                contactMessageRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size)),
                this::toResponse);
    }

    @Override
    @Transactional
    public ContactMessageResponse markRead(Long id) {
        ContactMessage message = findEntity(id);
        message.setRead(true);
        return toResponse(contactMessageRepository.save(message));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        contactMessageRepository.delete(findEntity(id));
    }

    private ContactMessage findEntity(Long id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Contact message", id));
    }

    private ContactMessageResponse toResponse(ContactMessage message) {
        return new ContactMessageResponse(
                message.getId(), message.getName(), message.getEmail(), message.getPhone(),
                message.getSubject(), message.getMessage(), message.isRead(), message.getCreatedAt());
    }
}
