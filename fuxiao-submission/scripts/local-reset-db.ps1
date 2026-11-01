<#
  重新导入演示数据（会清空内容表，不删除管理员账号）。
  默认需要输入 YES 确认。
#>
param([switch]$Force)

. "$PSScriptRoot\common.ps1"

if (-not $Force) {
  Write-Host "这会清空文章、影集、说说、项目、归档、友链、照片、投稿等表，" -ForegroundColor Yellow
  Write-Host "然后重新导入 db\data.sql。管理员账号与操作日志不会删除。" -ForegroundColor Yellow
  $answer = Read-Host "输入 YES 继续"
  if ($answer -ne "YES") { Write-Info "已取消"; return }
}

Start-Mysql
$schemaPath = (Join-Path $Root "db\schema.sql") -replace "\\", "/"
$dataPath = (Join-Path $Root "db\data.sql") -replace "\\", "/"

Write-Step "导入 schema.sql"
$code = Invoke-Mysql @("--execute=source $schemaPath")
if ($code -ne 0) { throw "schema.sql 导入失败" }

Write-Step "导入 data.sql"
$code = Invoke-Mysql @("--execute=source $dataPath")
if ($code -ne 0) { throw "data.sql 导入失败" }

$count = Get-MysqlScalar "SELECT COUNT(*) FROM fuxiao_admin.article"
Write-Info "完成：文章 $count 篇"
Show-Status
