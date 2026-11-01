package com.fuxiao.submission.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.publish")
@Getter
@Setter
public class PublishProperties {

    private boolean enabled = false;

    /** 服务器上博客源码目录，例如 /srv/fuxiao/app。 */
    private String blogDir;

    /** 构建命令，生产环境建议写绝对路径：/usr/bin/npm run build。 */
    private String buildCommand = "npm run build";

    /** 构建成功后重启博客的命令；留空表示不重启（本地测试用）。 */
    private String restartCommand;

    /** 重启后的健康检查地址。 */
    private String healthUrl = "http://127.0.0.1:3100/";

    /** 构建超时，秒。 */
    private int timeoutSeconds = 300;

    /** 给 Next 构建的 Node 内存上限。 */
    private String nodeOptions = "--max-old-space-size=3072";
}
