<#
  首次安装（Windows，便携模式）
  下载 Maven、MySQL 8，初始化本地数据库，安装前端依赖。
  不使用 Docker，也不需要管理员权限。
#>
param(
  [switch]$ForceSeed,
  [switch]$ForceInstall,
  [switch]$SkipNodeInstall
)

. "$PSScriptRoot\common.ps1"

$mavenUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
$mavenZip = Join-Path $Tools "apache-maven-3.9.9-bin.zip"
$mysqlZip = Join-Path $Tools "mysql-8.0.28-winx64.zip"
$mysqlUrls = @(
  "https://mirrors.aliyun.com/mysql/MySQL-8.0/mysql-8.0.28-winx64.zip",
  "https://repo.huaweicloud.com/mysql/Downloads/MySQL-8.0/mysql-8.0.28-winx64.zip",
  "https://mirrors.sohu.com/mysql/MySQL-8.0/mysql-8.0.28-winx64.zip"
)
$jdkUrl = "https://mirrors.tuna.tsinghua.edu.cn/Adoptium/21/jdk/x64/windows/OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip"
$jdkZip = Join-Path $Tools "jdk21.zip"

Write-Host ""
Write-Host "  拂晓的投稿系统 · 本地安装" -ForegroundColor White
Write-Host "  目标：Maven + MySQL 8 + 前端依赖，全部放在项目目录内。" -ForegroundColor DarkGray

Write-Step "检查 Node.js"
$node = Get-NodeExe
$nodeVersion = & $node --version
Write-Info "Node $nodeVersion"

Write-Step "检查 JDK"
$jdk = Find-Jdk
if (-not $jdk) {
  Write-Info "没有找到 JDK，下载 Temurin 21（约 190 MB）"
  if (-not (Test-Path $jdkZip)) {
    Get-FileWithNode $jdkUrl $jdkZip
  }
  $extract = Join-Path $Tools "jdk-extract"
  if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
  Expand-Zip $jdkZip $extract
  $jdkDir = Get-ChildItem $extract -Directory | Select-Object -First 1
  if (-not $jdkDir) { throw "JDK 压缩包解压后没有目录" }
  if (Test-Path (Join-Path $Tools "jdk")) { Remove-Item -Recurse -Force (Join-Path $Tools "jdk") }
  Move-Item $jdkDir.FullName (Join-Path $Tools "jdk")
  Remove-Item -Recurse -Force $extract
  $jdk = Find-Jdk
}
if (-not $jdk) { throw "没有可用的 JDK。请安装 JDK 17/21，或把 JAVA_HOME 指向它。" }
Save-Paths $jdk
Write-Info "JDK: $jdk"

Write-Step "检查 Maven"
if (-not (Get-MavenCmd)) {
  Write-Info "下载 Maven 3.9.9（约 9 MB）"
  if (-not (Test-Path $mavenZip)) { Get-FileWithNode $mavenUrl $mavenZip }
  Expand-Zip $mavenZip $Tools
}
if (-not (Get-MavenCmd)) { throw "Maven 解压失败" }
Write-MavenSettings
Write-Info "Maven: $MavenHome"
Write-Info "本地仓库: $(Join-Path $Tools 'm2')"

Write-Step "检查 MySQL 8"
if (-not (Get-Mysqld)) {
  if (-not (Test-Path $mysqlZip)) {
    $downloaded = $false
    foreach ($url in $mysqlUrls) {
      try {
        Write-Info "下载 MySQL 8.0.28（约 212 MB）：$url"
        Get-FileWithNode $url $mysqlZip
        $downloaded = $true
        break
      } catch {
        Write-Info "这个源不可用，换下一个"
        if (Test-Path "$mysqlZip.part") { Remove-Item "$mysqlZip.part" -Force }
      }
    }
    if (-not $downloaded) { throw "MySQL 下载失败，请检查网络或手动放到 $mysqlZip" }
  }
  Write-Info "解压 MySQL"
  $extract = Join-Path $Tools "mysql-extract"
  if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
  Expand-Zip $mysqlZip $extract
  $mysqlDir = Get-ChildItem $extract -Directory | Select-Object -First 1
  if (-not $mysqlDir) { throw "MySQL 压缩包解压后没有目录" }
  if (Test-Path $MysqlHome) { Remove-Item -Recurse -Force $MysqlHome }
  Move-Item $mysqlDir.FullName $MysqlHome
  Remove-Item -Recurse -Force $extract
}
$mysqld = Get-Mysqld
if (-not $mysqld) { throw "MySQL 解压失败" }
$version = (& $mysqld --version 2>&1 | Select-Object -First 1)
Write-Info $version

Write-Step "初始化数据库（端口 3307）"
$ini = Write-MysqlIni
$dataDir = Join-Path $Data "mysql\data"
if (-not (Test-Path (Join-Path $dataDir "mysql"))) {
  if (Test-Path $dataDir) { Remove-Item -Recurse -Force $dataDir }
  New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
  Write-Info "第一次初始化，约十几秒"
  & $mysqld "--defaults-file=$ini" "--initialize-insecure" "--console" 2>&1 | ForEach-Object { Write-Info $_ }
  if ($LASTEXITCODE -ne 0) { throw "MySQL 初始化失败，见 $(Join-Path $Data 'mysql\error.log')" }
}
Start-Mysql

Write-Step "准备数据库与演示数据"
if (-not (Test-MysqlPassword "fuxiao123")) {
  if (-not (Test-MysqlPassword "")) {
    throw "无法连接 MySQL。root 密码可能已被改过；请检查 $dataDir 或删除 .data\mysql 后重来。"
  }
  Invoke-Mysql @("--execute=ALTER USER 'root'@'localhost' IDENTIFIED BY 'fuxiao123';") "" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "设置 MySQL root 密码失败" }
  Write-Info "已设置本地 root 密码 fuxiao123"
}
$env:MYSQL_PWD = "fuxiao123"

$schemaPath = (Join-Path $Root "db\schema.sql") -replace "\\", "/"
$dataPath = (Join-Path $Root "db\data.sql") -replace "\\", "/"
$articleTable = Get-MysqlScalar "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='fuxiao_admin' AND table_name='article'"
if (-not $articleTable -or $articleTable -eq "0") {
  Write-Info "导入 schema.sql"
  $code = Invoke-Mysql @("--execute=source $schemaPath")
  if ($code -ne 0) { throw "导入 schema.sql 失败" }
}
$articleCount = Get-MysqlScalar "SELECT COUNT(*) FROM fuxiao_admin.article"
if ($ForceSeed -or -not $articleCount -or $articleCount -eq "0") {
  Write-Info "导入 data.sql（会清空内容表，不删除管理员账号）"
  $code = Invoke-Mysql @("--execute=source $dataPath")
  if ($code -ne 0) { throw "导入 data.sql 失败" }
  $articleCount = Get-MysqlScalar "SELECT COUNT(*) FROM fuxiao_admin.article"
}
Write-Info "文章 $articleCount 篇"

if (-not $SkipNodeInstall) {
  Write-Step "安装前端依赖"
  $web = Join-Path $Root "admin-web"
  Push-Location $web
  $env:npm_config_cache = Join-Path $Data "npm-cache"
  try {
    if ($ForceInstall -or -not (Test-Path "node_modules\vue\package.json")) {
      & npm.cmd install --no-audit --no-fund
      if ($LASTEXITCODE -ne 0) {
        Write-Info "常规安装没有完成，改用 --ignore-scripts 重试（esbuild 自带 Windows 二进制）"
        & npm.cmd install --ignore-scripts --no-audit --no-fund
      }
      if (-not (Test-Path "node_modules\@esbuild\win32-x64\esbuild.exe")) {
        Write-Info "补装 esbuild Windows 二进制"
        & npm.cmd install --ignore-scripts --no-audit --no-fund "@esbuild/win32-x64"
      }
      if ($LASTEXITCODE -ne 0) { throw "前端依赖安装失败" }
    } else {
      Write-Info "前端依赖已存在"
    }
  } finally {
    Pop-Location
  }
}

Save-Paths $jdk
Write-Step "安装完成"
Show-Status
Write-Host "  下一步：.\scripts\local-start.ps1" -ForegroundColor Yellow
Write-Host "  管理台：http://127.0.0.1:5174" -ForegroundColor Gray
Write-Host "  初始账号：admin / fuxiao@2026" -ForegroundColor Gray
Write-Host ""
