package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.entity.MediaAsset;
import com.fuxiao.submission.repository.MediaAssetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class MediaService {

    private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "webp", "gif", "avif");

    private final MediaAssetRepository mediaRepository;
    private final LogService logService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public MediaService(MediaAssetRepository mediaRepository, LogService logService) {
        this.mediaRepository = mediaRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<MediaAsset> list(String keyword, String source) {
        String key = keyword == null || keyword.isBlank() ? null : keyword.trim().toLowerCase(Locale.ROOT);
        String sourceKey = source == null || source.isBlank() ? null : source.trim().toUpperCase(Locale.ROOT);
        return mediaRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .filter(asset -> sourceKey == null || sourceKey.equals(asset.getSource()))
                .filter(asset -> key == null
                        || asset.getName().toLowerCase(Locale.ROOT).contains(key)
                        || asset.getPath().toLowerCase(Locale.ROOT).contains(key))
                .toList();
    }

    public MediaAsset upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("没有收到文件");
        }
        String mime = file.getContentType();
        if (mime == null || !mime.startsWith("image/")) {
            throw new BusinessException("只能上传图片");
        }
        String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String ext = extension(original);
        if (!ALLOWED_EXT.contains(ext)) {
            throw new BusinessException("只支持 jpg / png / webp / gif / avif");
        }

        Path root = root();
        String folder = DateTimeFormatter.ofPattern("yyyy/MM").format(LocalDate.now());
        Path dir = root.resolve(folder);
        try {
            Files.createDirectories(dir);
            String stored = UUID.randomUUID().toString().replace("-", "") + "." + ext;
            Path target = dir.resolve(stored);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            MediaAsset asset = new MediaAsset();
            asset.setName(original);
            asset.setPath("/uploads/" + folder + "/" + stored);
            asset.setSource(MediaAsset.SOURCE_UPLOAD);
            asset.setMime(mime);
            asset.setSize(file.getSize());
            readDimensions(target, asset);
            asset.setCreatedAt(LocalDateTime.now());
            MediaAsset saved = mediaRepository.save(asset);
            logService.record("media", "上传图片", original, saved.getPath());
            return saved;
        } catch (IOException e) {
            throw new BusinessException("图片保存失败：" + e.getMessage());
        }
    }

    public void delete(Long id) {
        MediaAsset asset = mediaRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("图片"));
        if (!MediaAsset.SOURCE_UPLOAD.equals(asset.getSource())) {
            throw new BusinessException("博客原有图片不能在后台删除，请直接改 public/media");
        }
        String relative = asset.getPath().replaceFirst("^/uploads/", "");
        Path target = root().resolve(relative).normalize();
        if (!target.startsWith(root())) {
            throw new BusinessException("文件路径不合法");
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new BusinessException("文件删除失败：" + e.getMessage());
        }
        mediaRepository.delete(asset);
        logService.record("media", "删除图片", asset.getName(), asset.getPath());
    }

    private void readDimensions(Path file, MediaAsset asset) {
        try {
            BufferedImage image = ImageIO.read(file.toFile());
            if (image != null) {
                asset.setWidth(image.getWidth());
                asset.setHeight(image.getHeight());
            }
        } catch (IOException ignored) {
            // webp / avif 可能没有 ImageIO 解码器，忽略尺寸即可
        }
    }

    private Path root() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    private String extension(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return "";
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
