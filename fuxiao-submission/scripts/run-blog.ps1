. "$PSScriptRoot\common.ps1"
$ErrorActionPreference = "Continue"

$blogRoot = Split-Path -Parent $Root
$env:TEMP = Join-Path $Data "tmp"
$env:TMP = $env:TEMP
$env:NEXT_TELEMETRY_DISABLED = "1"

Set-Location $blogRoot
Write-Host "启动博客（Next.js，127.0.0.1:3100）……" -ForegroundColor Cyan
& npm.cmd run dev
