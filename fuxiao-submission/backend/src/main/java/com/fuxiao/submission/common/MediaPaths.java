package com.fuxiao.submission.common;

/** 图片路径约定：博客原有图片在 /media/，后台上传的在 /uploads/。 */
public final class MediaPaths {

    private MediaPaths() {
    }

    public static String normalize(String path) {
        if (path == null) {
            return null;
        }
        String value = path.trim();
        if (value.isEmpty()) {
            return null;
        }
        if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
            return value;
        }
        return "/media/" + value;
    }

    /** 导出给博客时，只保留 public/media 下的文件名。 */
    public static String fileName(String path) {
        if (path == null) {
            return null;
        }
        String value = path.trim();
        int slash = value.lastIndexOf('/');
        return slash >= 0 ? value.substring(slash + 1) : value;
    }

    public static String stem(String path) {
        String name = fileName(path);
        if (name == null) {
            return null;
        }
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }
}
