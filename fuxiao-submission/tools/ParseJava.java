import com.sun.source.util.JavacTask;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * 只做语法解析（javac parse 阶段），不解析依赖，因此没有 Maven 仓库也能跑。
 * 用法：java ParseJava <java源码目录>
 */
public class ParseJava {

    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.err.println("usage: java ParseJava <source-root>");
            System.exit(2);
        }
        Path root = Paths.get(args[0]);
        List<File> files = new ArrayList<>();
        try (Stream<Path> stream = Files.walk(root)) {
            stream.filter(path -> path.toString().endsWith(".java"))
                    .forEach(path -> files.add(path.toFile()));
        }

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);
        Iterable<? extends JavaFileObject> units = fileManager.getJavaFileObjectsFromFiles(files);

        JavacTask task = (JavacTask) compiler.getTask(
                null, fileManager, diagnostics, List.of("-proc:none"), null, units);
        task.parse();

        int errors = 0;
        for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
            if (diagnostic.getKind() == Diagnostic.Kind.ERROR) {
                errors += 1;
                System.out.println(diagnostic);
            }
        }
        System.out.println("parsed " + files.size() + " java files, " + errors + " syntax errors");
        fileManager.close();
        if (errors > 0) {
            System.exit(1);
        }
    }
}
