package com.vitalora.api.service;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.contact.ContactMessageRequest;
import com.vitalora.api.dto.contact.ContactMessageResponse;

public interface ContactService {
    ContactMessageResponse submit(ContactMessageRequest request);

    PageResponse<ContactMessageResponse> getAllForAdmin(int page, int size);

    ContactMessageResponse markRead(Long id);

    void delete(Long id);
}
