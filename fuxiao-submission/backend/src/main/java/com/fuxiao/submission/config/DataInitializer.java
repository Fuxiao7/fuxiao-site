package com.fuxiao.submission.config;

import com.fuxiao.submission.entity.AdminUser;
import com.fuxiao.submission.entity.Category;
import com.fuxiao.submission.repository.AdminUserRepository;
import com.fuxiao.submission.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminUserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.init-password}")
    private String initPassword;

    public DataInitializer(AdminUserRepository userRepository,
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode(initPassword));
            admin.setNickname("拂晓");
            admin.setRole("ADMIN");
            admin.setEmail("470379769@qq.com");
            admin.setEnabled(true);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            log.info("已创建初始管理员账号 admin，初始密码：{}（请登录后立即修改）", initPassword);
        }

        if (categoryRepository.count() == 0) {
            List<String[]> defaults = List.of(
                    new String[]{"技术随笔", "tech", "tech"},
                    new String[]{"读书", "read", "read"},
                    new String[]{"生活", "life", "life"},
                    new String[]{"摄影随笔", "photo", "photo"},
                    new String[]{"写字", "write", "write"});
            int sort = 1;
            for (String[] item : defaults) {
                Category category = new Category();
                category.setName(item[0]);
                category.setSlug(item[1]);
                category.setStatusKey(item[2]);
                category.setSortOrder(sort++);
                category.setVisible(true);
                category.setCreatedAt(LocalDateTime.now());
                categoryRepository.save(category);
            }
            log.info("分类表为空，已写入 5 个默认分类");
        }
    }
}
