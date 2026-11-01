. "$PSScriptRoot\common.ps1"
$ErrorActionPreference = "Continue"

$env:npm_config_cache = Join-Path $Data "npm-cache"
$env:TEMP = Join-Path $Data "tmp"
$env:TMP = $env:TEMP
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null

Set-Location (Join-Path $Root "admin-web")
Write-Host "启动管理台（Vite，127.0.0.1:5174）……" -ForegroundColor Cyan
& npm.cmd run dev
