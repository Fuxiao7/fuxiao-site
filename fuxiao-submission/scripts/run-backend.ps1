. "$PSScriptRoot\common.ps1"
$ErrorActionPreference = "Continue"

$jdk = Find-Jdk
if (-not $jdk) { throw "没有找到 JDK，请先运行 scripts/local-setup.ps1" }
Save-Paths $jdk

$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$MavenHome\bin;$env:Path"
$env:MAVEN_OPTS = "-Duser.home=$((Join-Path $Tools 'home') -replace '\\','/')"
$env:TEMP = Join-Path $Data "tmp"
$env:TMP = $env:TEMP
$env:SPRING_PROFILES_ACTIVE = "local"
$env:UPLOAD_DIR = Join-Path $Data "uploads"

New-Item -ItemType Directory -Force -Path (Join-Path $Tools "home"), $env:TEMP, $env:UPLOAD_DIR | Out-Null
Write-MavenSettings

$maven = Get-MavenCmd
if (-not $maven) { throw "没有找到 Maven，请先运行 scripts/local-setup.ps1" }

Set-Location (Join-Path $Root "backend")
Write-Host "JAVA_HOME=$jdk" -ForegroundColor DarkGray
Write-Host "Maven=$maven" -ForegroundColor DarkGray
Write-Host "启动 Spring Boot（local profile，MySQL 127.0.0.1:3307）……" -ForegroundColor Cyan

& $maven -B -s (Join-Path $Tools "maven-settings.xml") spring-boot:run
exit $LASTEXITCODE
