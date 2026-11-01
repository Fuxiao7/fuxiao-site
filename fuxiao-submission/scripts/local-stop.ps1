<#
  停止本地服务。默认停止 MySQL、后端、管理台；如果博客是由本项目的 local-start 启动的，
  也会一并停止。显式加 -WithBlog 可以强制停止 3100 上的博客。
#>
param(
  [switch]$WithBlog
)

. "$PSScriptRoot\common.ps1"

Write-Host ""
Write-Host "  拂晓的投稿系统 · 停止本地服务" -ForegroundColor White

$blogPidFile = Join-Path $Pids "blog.pid"
$stopBlog = $WithBlog -or (Test-Path $blogPidFile)

Write-Step "停止 MySQL"
if (Test-Port 3307) {
  $mysqladmin = Get-MysqlAdmin
  if ($mysqladmin) {
    $old = $env:MYSQL_PWD
    $env:MYSQL_PWD = "fuxiao123"
    & $mysqladmin "--host=127.0.0.1" "--port=3307" "--user=root" "shutdown" 2>$null | Out-Null
    $env:MYSQL_PWD = $old
    if (Wait-Port 3307 10) { Stop-PortProcess 3307 }
    else { Write-Info "MySQL 已停止" }
  } else {
    Stop-PortProcess 3307
  }
} else {
  Write-Info "MySQL 未运行"
}

foreach ($name in @("backend", "frontend", "blog")) {
  $pidFile = Join-Path $Pids "$name.pid"
  if (Test-Path $pidFile) {
    $processId = Get-Content $pidFile | Select-Object -First 1
    if ($processId) {
      # /T 会一起结束 npm、Maven、node 等子进程
      & taskkill.exe /F /T /PID ([int]$processId) 2>$null | Out-Null
      Write-Info "已停止 $name（PID $processId）"
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }
}

Write-Step "清理端口"
foreach ($port in @(8080, 5174)) {
  if (Test-Port $port) { Stop-PortProcess $port }
}
if ($stopBlog -and (Test-Port 3100)) {
  Stop-PortProcess 3100
} elseif (Test-Port 3100) {
  Write-Info "博客仍在 3100 运行（如需停止：.\scripts\local-stop.ps1 -WithBlog）"
}

Start-Sleep -Seconds 1
Show-Status
