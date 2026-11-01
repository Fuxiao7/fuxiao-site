# 启动后端（Windows PowerShell）
# 优先使用项目自带的便携环境（MySQL 3307 + 工作区 Maven 仓库）；
# 没有便携环境时，回退到系统 mvn（默认连接 3306）。
$ErrorActionPreference = "Continue"

$portable = Join-Path (Split-Path $PSScriptRoot -Parent) "scripts\run-backend.ps1"
if (Test-Path $portable) {
  & $portable
  exit $LASTEXITCODE
}

Set-Location $PSScriptRoot
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = "fuxiao123" }
mvn spring-boot:run
