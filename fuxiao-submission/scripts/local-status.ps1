. "$PSScriptRoot\common.ps1"

Write-Host ""
Write-Host "  拂晓的投稿系统 · 状态" -ForegroundColor White

$jdk = Find-Jdk
Write-Info "JDK    $jdk"
Write-Info "Maven  $MavenHome"
Write-Info "MySQL  $MysqlHome"
Write-Info "数据   $(Join-Path $Data 'mysql\data')"
Write-Info "上传   $(Join-Path $Data 'uploads')"
Write-Info "日志   $Logs"

Show-Status

if (Test-Port 3307) {
  $version = Get-MysqlScalar "SELECT CONCAT(VERSION(), ' / ', COUNT(*), ' articles') FROM fuxiao_admin.article"
  if ($version) { Write-Info "数据库 $version" }
}
if (Test-Port 8080) {
  try {
    $response = Invoke-WebRequest "http://127.0.0.1:8080/api/public/site" -UseBasicParsing -TimeoutSec 5
    Write-Info "后端接口 HTTP $($response.StatusCode)"
  } catch {
    Write-Info "后端端口开着，但接口没有响应"
  }
}
if (Test-Port 5174) {
  try {
    $response = Invoke-WebRequest "http://127.0.0.1:5174/" -UseBasicParsing -TimeoutSec 5
    Write-Info "管理台 HTTP $($response.StatusCode)"
  } catch {
    Write-Info "管理台端口开着，但页面没有响应"
  }
}

Write-Host ""
Write-Host "  最近的后端日志" -ForegroundColor White
Get-Content (Join-Path $Logs "backend.out.log") -Tail 8 -ErrorAction SilentlyContinue
