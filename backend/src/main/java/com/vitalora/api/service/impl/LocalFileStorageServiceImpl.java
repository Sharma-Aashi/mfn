package com.vitalora.api.service.impl;

import com.vitalora.api.config.AppProperties;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalFileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif", "svg");

    private final AppProperties appProperties;

    @Override
    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = getExtension(original);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Unsupported image type. Allowed: " + ALLOWED_EXTENSIONS);
        }

        String filename = UUID.randomUUID() + "." + extension.toLowerCase();

        try {
            Path targetDir = Path.of(appProperties.getUpload().getDir(), subfolder).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(filename);
            try (var in = file.getInputStream()) {
                Files.copy(in, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return appProperties.getUpload().getPublicPath() + "/" + subfolder + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store uploaded file", e);
            throw new BadRequestException("Could not save the uploaded file. Please try again.");
        }
    }

    @Override
    public void delete(String publicUrl) {
        String prefix = appProperties.getUpload().getPublicPath() + "/";
        if (publicUrl == null || !publicUrl.startsWith(prefix)) {
            return;
        }
        try {
            String relative = publicUrl.substring(prefix.length());
            Path baseDir = Path.of(appProperties.getUpload().getDir()).toAbsolutePath().normalize();
            Path target = baseDir;
            for (String segment : relative.split("/")) {
                target = target.resolve(segment);
            }
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", publicUrl, e.getMessage());
        }
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 && dot < filename.length() - 1 ? filename.substring(dot + 1) : "";
    }
}
