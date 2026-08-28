package com.vitalora.api.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Stores the given file under a subfolder and returns a public URL path (e.g. /uploads/products/xyz.jpg).
     */
    String store(MultipartFile file, String subfolder);

    /**
     * Best-effort delete of a previously stored file, given its public URL path.
     */
    void delete(String publicUrl);
}
