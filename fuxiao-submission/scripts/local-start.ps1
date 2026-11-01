<#
  启动本地服务：MySQL 3307 → 后端 8080 → 管理台 5174 → 博客 3100（可选）
#>
param(
  [switch]$SkipBlog,
  [switch]$NoBrowser
)

. "$PSScriptRoot\common.ps1"

Write-Host ""
Write-Host "  拂晓的投稿系统 · 本地启动" -ForegroundColor White

$jdk = Find-Jdk
$maven = Get-MavenCmd
$mysql = Get-Mysqld
$webInstalled = Test-Path (Join-Path $Root "admin-web\node_modules\vue\package.json")

if (-not $jdk -or -not $maven -or -not $mysql -or -not $webInstalled) {
  Write-Info "检测到尚未安装完整，先运行本地安装……"
  & (Join-Path $PSScriptRoot "local-setup.ps1")
  . "$PSScriptRoot\common.ps1"
  $jdk = Find-Jdk
}

if (-not $jdk) { throw "没有找到 JDK，请设置 JAVA_HOME 或重新运行 local-setup.ps1" }
Save-Paths $jdk

Start-Mysql
Start-Backend
Start-Frontend
if (-not $SkipBlog) { Start-Blog | Out-Null }

Show-Status

Write-Host ""
Write-Host "  管理台    http://127.0.0.1:5174" -ForegroundColor Green
Write-Host "  后端接口  http://127.0.0.1:8080/api" -ForegroundColor Gray
Write-Host "  投稿页    http://127.0.0.1:5174/submit" -ForegroundColor Gray
if (Test-Port 3100) {
  Write-Host "  博客      http://127.0.0.1:3100" -ForegroundColor Gray
}
Write-Host "  账号      admin / fuxiao@2026" -ForegroundColor Gray
Write-Host ""
Write-Host "  停止服务：.\scripts\local-stop.ps1" -ForegroundColor DarkGray
Write-Host "  查看状态：.\scripts\local-status.ps1" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
  Start-Process "http://127.0.0.1:5174"
}
