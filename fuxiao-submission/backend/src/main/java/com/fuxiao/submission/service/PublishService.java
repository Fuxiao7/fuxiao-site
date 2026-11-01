package com.fuxiao.submission.service;

import com.fuxiao.submission.common.BusinessException;
import com.fuxiao.submission.config.PublishProperties;
import com.fuxiao.submission.dto.PublishStatus;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

/**
 * 把后台内容写进服务器上的博客源码，构建 Next，然后在构建成功后重启博客。
 * 构建失败会恢复旧的内容文件，线上继续跑旧版本。
 */
@Service
public class PublishService {

    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final int MAX_LOG_CHARS = 30000;
    private static final String STAGING_DIST = ".next-publish";
    private static final String BACKUP_DIST = ".next-backup";

    private final PublishProperties properties;
    private final ExportService exportService;
    private final LogService logService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    private final ExecutorService executor = Executors.newSingleThreadExecutor(task -> {
        Thread thread = new Thread(task, "fuxiao-publish");
        thread.setDaemon(true);
        return thread;
    });

    private final Object lock = new Object();
    private volatile String state = "idle";
    private volatile String message = "尚未发布";
    private volatile String startedAt;
    private volatile String finishedAt;
    private volatile String logText = "";

    public PublishService(PublishProperties properties, ExportService exportService, LogService logService) {
        this.properties = properties;
        this.exportService = exportService;
        this.logService = logService;
    }

    public PublishStatus status() {
        return new PublishStatus(properties.isEnabled(), state, message, startedAt, finishedAt, logText);
    }

    public PublishStatus start(String username) {
        if (!properties.isEnabled()) {
            throw new BusinessException("线上发布尚未启用，请检查 PUBLISH_ENABLED / BLOG_DIR 配置");
        }
        synchronized (lock) {
            if ("running".equals(state)) {
                throw new BusinessException(409, HttpStatus.CONFLICT, "正在发布，请等这次构建结束");
            }
            state = "running";
            message = "正在导出内容并构建博客…";
            startedAt = now();
            finishedAt = null;
            logText = "";
            logService.record(username, "publish", "发布到线上", "博客", "开始构建");
            executor.submit(() -> runPublish(username));
            return status();
        }
    }

    private void runPublish(String username) {
        StringBuilder log = new StringBuilder();
        Map<Path, byte[]> backups = new LinkedHashMap<>();
        Path blog = null;
        boolean staged = false;
        boolean swapped = false;
        try {
            if (!hasText(properties.getBlogDir())) {
                throw new IllegalStateException("没有配置 BLOG_DIR");
            }
            blog = Paths.get(properties.getBlogDir()).toAbsolutePath().normalize();
            if (!Files.isDirectory(blog)) {
                throw new IllegalStateException("博客目录不存在：" + blog);
            }
            Path lib = blog.resolve("lib");
            Path media = blog.resolve("public").resolve("media");
            Files.createDirectories(lib);
            Files.createDirectories(media);
            append(log, "博客目录：" + blog);

            backup(lib.resolve("content.json"), backups);
            backup(lib.resolve("article-bodies.json"), backups);
            backup(lib.resolve("bodies.js"), backups);

            append(log, "导出 content.json / article-bodies.json / bodies.js …");
            writeAtomic(lib.resolve("content.json"), exportService.contentJson());
            writeAtomic(lib.resolve("article-bodies.json"), exportService.articleBodiesJson());
            writeAtomic(lib.resolve("bodies.js"), exportService.bodiesJs());
            append(log, "内容文件已写入 lib/");

            int copied = copyUploads(media, log);
            append(log, "同步上传图片 " + copied + " 张");

            // 有重启命令时构建到独立目录，构建期间线上继续用旧 .next。
            staged = hasText(properties.getRestartCommand());
            if (staged) {
                deleteRecursively(blog.resolve(STAGING_DIST));
                append(log, "构建到临时目录 " + STAGING_DIST + "，完成后原子切换");
            }
            runCommand(properties.getBuildCommand(), blog, log, "构建博客", staged ? STAGING_DIST : null);
            if (staged) {
                swapNext(blog, log);
                swapped = true;
            }

            if (hasText(properties.getRestartCommand())) {
                runCommand(properties.getRestartCommand(), blog, log, "重启博客", null);
                waitHealthy(log);
            } else {
                append(log, "未配置重启命令，跳过重启（仅适合本地测试）");
            }

            if (staged) {
                deleteRecursively(blog.resolve(BACKUP_DIST));
            }
            state = "success";
            message = "发布完成，线上已更新";
            append(log, "发布成功");
            logService.record(username, "publish", "发布到线上", "博客", "成功");
        } catch (Exception ex) {
            if (blog != null && swapped) {
                restoreNext(blog, log);
                if (hasText(properties.getRestartCommand())) {
                    try {
                        runCommand(properties.getRestartCommand(), blog, log, "恢复旧版本", null);
                    } catch (Exception restartFailed) {
                        append(log, "恢复旧版本时重启失败：" + describe(restartFailed));
                    }
                }
            }
            if (blog != null) {
                deleteRecursively(blog.resolve(STAGING_DIST));
            }
            if (!backups.isEmpty()) {
                restore(backups, log);
            }
            state = "failed";
            message = "发布失败：" + describe(ex);
            append(log, "发布失败：" + describe(ex));
            logService.record(username, "publish", "发布到线上", "博客", "失败：" + describe(ex));
        } finally {
            finishedAt = now();
            logText = tail(log.toString());
        }
    }

    private void swapNext(Path blog, StringBuilder log) throws IOException {
        Path current = blog.resolve(".next");
        Path staging = blog.resolve(STAGING_DIST);
        Path backup = blog.resolve(BACKUP_DIST);
        if (!Files.isDirectory(staging)) {
            throw new IOException("构建产物不存在：" + staging);
        }
        deleteRecursively(backup);
        try {
            if (Files.exists(current)) {
                Files.move(current, backup);
            }
            Files.move(staging, current);
            append(log, "已切换到新构建产物");
        } catch (IOException ex) {
            if (!Files.exists(current) && Files.exists(backup)) {
                Files.move(backup, current);
            }
            throw ex;
        }
    }

    private void restoreNext(Path blog, StringBuilder log) {
        Path current = blog.resolve(".next");
        Path backup = blog.resolve(BACKUP_DIST);
        if (!Files.isDirectory(backup)) {
            append(log, "没有可恢复的旧构建产物");
            return;
        }
        try {
            deleteRecursively(current);
            Files.move(backup, current);
            append(log, "已恢复上一版构建产物");
        } catch (IOException ex) {
            append(log, "恢复旧构建产物失败：" + describe(ex));
        }
    }

    private void deleteRecursively(Path path) {
        if (!Files.exists(path)) {
            return;
        }
        try (Stream<Path> walk = Files.walk(path)) {
            for (Path item : walk.sorted(Comparator.reverseOrder()).toList()) {
                Files.deleteIfExists(item);
            }
        } catch (IOException ignored) {
            // 清理失败不影响当前发布
        }
    }

    private void runCommand(String command, Path workingDir, StringBuilder log, String label, String distDir)
            throws Exception {
        if (!hasText(command)) {
            append(log, label + "：未配置命令，跳过");
            return;
        }
        append(log, "$ " + command);
        boolean windows = System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win");
        List<String> shell = windows
                ? List.of("cmd.exe", "/c", command)
                : List.of("/bin/sh", "-c", command);

        ProcessBuilder builder = new ProcessBuilder(shell)
                .directory(workingDir.toFile())
                .redirectErrorStream(true);
        if (hasText(properties.getNodeOptions())) {
            builder.environment().put("NODE_OPTIONS", properties.getNodeOptions());
        }
        if (hasText(distDir)) {
            builder.environment().put("NEXT_DIST_DIR", distDir);
        }
        builder.environment().put("NEXT_TELEMETRY_DISABLED", "1");
        builder.environment().putIfAbsent("CI", "1");

        Process process = builder.start();
        CompletableFuture<Void> drain = CompletableFuture.runAsync(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    append(log, line);
                }
            } catch (IOException ignored) {
                // 进程结束时流会关闭
            }
        });

        boolean finished = process.waitFor(properties.getTimeoutSeconds(), TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            drain.get(5, TimeUnit.SECONDS);
            throw new IllegalStateException(label + "超时（" + properties.getTimeoutSeconds() + " 秒）");
        }
        try {
            drain.get(10, TimeUnit.SECONDS);
        } catch (Exception ignored) {
            // 日志读不完不影响退出码
        }
        int exit = process.exitValue();
        if (exit != 0) {
            throw new IllegalStateException(label + "失败（退出码 " + exit + "）");
        }
        append(log, label + "完成");
    }

    private int copyUploads(Path mediaDir, StringBuilder log) throws IOException {
        if (!hasText(uploadDir)) {
            return 0;
        }
        Path source = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.isDirectory(source)) {
            append(log, "上传目录不存在，跳过图片同步：" + source);
            return 0;
        }
        int copied = 0;
        try (Stream<Path> stream = Files.walk(source)) {
            List<Path> files = stream.filter(Files::isRegularFile).toList();
            for (Path file : files) {
                Path target = mediaDir.resolve(file.getFileName().toString()).normalize();
                if (!target.startsWith(mediaDir)) {
                    continue;
                }
                if (Files.exists(target) && Files.size(target) == Files.size(file)) {
                    continue;
                }
                Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
                copied += 1;
            }
        }
        return copied;
    }

    private void backup(Path path, Map<Path, byte[]> backups) throws IOException {
        backups.put(path, Files.exists(path) ? Files.readAllBytes(path) : null);
    }

    private void restore(Map<Path, byte[]> backups, StringBuilder log) {
        backups.forEach((path, bytes) -> {
            try {
                if (bytes == null) {
                    Files.deleteIfExists(path);
                } else {
                    writeAtomic(path, new String(bytes, StandardCharsets.UTF_8));
                }
                append(log, "已恢复 " + path.getFileName());
            } catch (Exception ex) {
                append(log, "恢复失败 " + path.getFileName() + "：" + describe(ex));
            }
        });
    }

    private void writeAtomic(Path target, String content) throws IOException {
        Path parent = target.getParent();
        Files.createDirectories(parent);
        Path temp = Files.createTempFile(parent, ".publish-", ".tmp");
        Files.writeString(temp, content, StandardCharsets.UTF_8);
        try {
            Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException atomicFailed) {
            Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private void waitHealthy(StringBuilder log) throws Exception {
        String url = properties.getHealthUrl();
        if (!hasText(url)) {
            return;
        }
        append(log, "等待博客健康检查：" + url);
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        for (int attempt = 0; attempt < 30; attempt += 1) {
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                        .timeout(Duration.ofSeconds(3))
                        .GET()
                        .build();
                HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
                if (response.statusCode() < 500) {
                    append(log, "健康检查通过（HTTP " + response.statusCode() + "）");
                    return;
                }
            } catch (Exception ignored) {
                // 服务还在重启
            }
            Thread.sleep(1000);
        }
        throw new IllegalStateException("重启后健康检查失败");
    }

    private void append(StringBuilder log, String line) {
        synchronized (log) {
            if (log.length() > MAX_LOG_CHARS) {
                log.delete(0, log.length() - MAX_LOG_CHARS);
            }
            log.append(line).append('\n');
        }
    }

    private String tail(String value) {
        return value.length() <= MAX_LOG_CHARS ? value : value.substring(value.length() - MAX_LOG_CHARS);
    }

    private String describe(Throwable throwable) {
        String message = throwable.getMessage();
        return hasText(message) ? message : throwable.getClass().getSimpleName();
    }

    private String now() {
        return LocalDateTime.now().format(TIMESTAMP);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    @PreDestroy
    public void shutdown() {
        executor.shutdownNow();
    }
}
