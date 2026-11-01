package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.common.MediaPaths;
import com.fuxiao.submission.entity.Photo;
import com.fuxiao.submission.repository.PhotoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final LogService logService;

    public PhotoService(PhotoRepository photoRepository, LogService logService) {
        this.photoRepository = photoRepository;
        this.logService = logService;
    }

    @Transactional(readOnly = true)
    public List<Photo> list(String collection, String keyword) {
        String key = keyword == null || keyword.isBlank() ? null : keyword.trim().toLowerCase();
        List<Photo> photos = collection == null || collection.isBlank()
                ? photoRepository.findAllByOrderBySortOrderAscIdAsc()
                : photoRepository.findByCollectionOrderBySortOrderAscIdAsc(collection);
        if (key == null) {
            return photos;
        }
        return photos.stream()
                .filter(photo -> matches(photo, key))
                .toList();
    }

    public Photo create(Photo payload) {
        Photo photo = new Photo();
        apply(photo, payload);
        photo.setCreatedAt(LocalDateTime.now());
        Photo saved = photoRepository.save(photo);
        logService.record("photo", "新建照片", saved.getTitle(), "分区 " + saved.getCollection());
        return saved;
    }

    public Photo update(Long id, Photo payload) {
        Photo photo = find(id);
        apply(photo, payload);
        Photo saved = photoRepository.save(photo);
        logService.record("photo", "修改照片", saved.getTitle(), null);
        return saved;
    }

    public void delete(Long id) {
        Photo photo = find(id);
        photoRepository.delete(photo);
        logService.record("photo", "删除照片", photo.getTitle(), null);
    }

    private void apply(Photo photo, Photo payload) {
        if (payload == null) {
            throw new BusinessException("没有收到照片内容");
        }
        String title = payload.getTitle() == null ? null : payload.getTitle().trim();
        if (title == null || title.isBlank()) {
            throw new BusinessException("请填写照片标题");
        }
        String image = MediaPaths.normalize(payload.getImage());
        if (image == null) {
            throw new BusinessException("请选择照片");
        }
        photo.setTitle(title);
        photo.setImage(image);
        photo.setExif(payload.getExif());
        photo.setAlt(payload.getAlt());
        photo.setCollection(Photo.SCATTER.equals(payload.getCollection()) ? Photo.SCATTER : Photo.WALL);
        photo.setShotOn(payload.getShotOn());
        if (payload.getSortOrder() != null) {
            photo.setSortOrder(payload.getSortOrder());
        }
        photo.setVisible(payload.getVisible() == null || payload.getVisible());
    }

    private boolean matches(Photo photo, String keyword) {
        return contains(photo.getTitle(), keyword)
                || contains(photo.getExif(), keyword)
                || contains(photo.getAlt(), keyword)
                || contains(photo.getImage(), keyword);
    }

    private boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase().contains(keyword);
    }

    private Photo find(Long id) {
        return photoRepository.findById(id).orElseThrow(() -> BusinessException.notFound("照片"));
    }
}
