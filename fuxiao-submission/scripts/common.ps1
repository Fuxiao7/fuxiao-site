# 便携本地运行（Windows，无需 Docker、无需管理员权限）
# 由 scripts/local-setup.ps1 与 scripts/local-start.ps1 使用。

$ErrorActionPreference = "Continue"

# 让 MySQL / Maven / npm 的中文输出按 UTF-8 解码
try {
  [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
  $OutputEncoding = New-Object System.Text.UTF8Encoding($false)
} catch { }

$Root = Split-Path -Parent $PSScriptRoot
$Tools = Join-Path $Root ".tools"
$Data = Join-Path $Root ".data"
$Logs = Join-Path $Data "logs"
$Pids = Join-Path $Data "pids"
$MavenHome = Join-Path $Tools "apache-maven-3.9.9"
$MysqlHome = Join-Path $Tools "mysql"
$JdkArchive = Join-Path $Tools "temurin21.zip"

foreach ($dir in @($Tools, $Data, $Logs, $Pids, (Join-Path $Data "tmp"))) {
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
}

# 所有子进程（MySQL、Maven、npm）都使用工作区内的临时目录，避免系统临时目录权限问题。
$env:TEMP = Join-Path $Data "tmp"
$env:TMP = $env:TEMP

$PathsFile = Join-Path $Data "paths.json"

function Write-Step([string]$text) {
  Write-Host ""
  Write-Host "==> $text" -ForegroundColor Cyan
}

function Write-Info([string]$text) {
  Write-Host "    $text"
}

function Test-Port([int]$Port) {
  $client = New-Object Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync("127.0.0.1", $Port)
    if ($task.Wait(600) -and $client.Connected) { return $true }
    return $false
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Wait-Port([int]$Port, [int]$Seconds = 40) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-Port $Port) { return $true }
    Start-Sleep -Milliseconds 500
  }
  return $false
}

function Wait-Http([string]$Url, [int]$Seconds = 180) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return $true }
    } catch {
      # 还没起来
    }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Get-PortOwner([int]$Port) {
  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($connection) { return [int]$connection.OwningProcess }

  # 某些受限环境里 Get-NetTCPConnection 不可用，退回 netstat。
  $lines = & netstat.exe -ano -p tcp 2>$null
  foreach ($line in $lines) {
    if ($line -match ":$Port\s+.*(?:LISTENING|侦听)\s+(\d+)\s*$") {
      return [int]$matches[1]
    }
  }
  return $null
}

function Stop-PortProcess([int]$Port) {
  $processId = Get-PortOwner $Port
  if ($processId) {
    & taskkill.exe /F /T /PID $processId 2>$null | Out-Null
    Start-Sleep -Milliseconds 300
    if (Get-PortOwner $Port) {
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
    Write-Info "已停止端口 $Port 上的进程 $processId"
  }
}

function Get-NodeExe {
  $node = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($node) { return $node.Source }
  throw "没有找到 Node.js。请先安装 Node 18+（https://nodejs.org/）。"
}

function Get-FileWithNode([string]$Url, [string]$Output) {
  $node = Get-NodeExe
  $fetch = Join-Path $Root "tools\fetch.mjs"
  & $node $fetch $Url $Output
  if ($LASTEXITCODE -ne 0) { throw "下载失败：$Url" }
}

function Expand-Zip([string]$Zip, [string]$Destination) {
  if (-not (Test-Path $Destination)) { New-Item -ItemType Directory -Force -Path $Destination | Out-Null }
  $tar = Get-Command tar.exe -ErrorAction SilentlyContinue
  if ($tar) {
    & $tar.Source -xf $Zip -C $Destination
    if ($LASTEXITCODE -ne 0) { throw "解压失败：$Zip" }
    return
  }
  Expand-Archive -Path $Zip -DestinationPath $Destination -Force
}

function Find-Jdk {
  $candidates = New-Object System.Collections.ArrayList

  if (Test-Path $PathsFile) {
    try {
      $saved = Get-Content $PathsFile -Raw | ConvertFrom-Json
      if ($saved.jdk) { [void]$candidates.Add([string]$saved.jdk) }
    } catch { }
  }
  if ($env:JAVA_HOME) { [void]$candidates.Add($env:JAVA_HOME) }

  $javac = Get-Command javac.exe -ErrorAction SilentlyContinue
  if ($javac) { [void]$candidates.Add((Split-Path (Split-Path $javac.Source -Parent) -Parent)) }

  foreach ($pattern in @(
      (Join-Path $Tools "jdk*"),
      (Join-Path $env:APPDATA ".minecraft\runtime\*"),
      "C:\Program Files\Java\*",
      "C:\Program Files\Eclipse Adoptium\*",
      "C:\Program Files\Microsoft\jdk*",
      "C:\Program Files\Amazon Corretto\*"
    )) {
    Get-Item $pattern -ErrorAction SilentlyContinue | ForEach-Object {
      if ($_.PSIsContainer) { [void]$candidates.Add($_.FullName) }
    }
  }

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path (Join-Path $candidate "bin\javac.exe"))) {
      return [string]$candidate
    }
  }
  return $null
}

function Save-Paths([string]$Jdk) {
  $payload = [ordered]@{ jdk = $Jdk; maven = $MavenHome; mysql = $MysqlHome }
  $json = $payload | ConvertTo-Json -Compress
  [IO.File]::WriteAllText($PathsFile, $json, (New-Object Text.UTF8Encoding($false)))
}

function Get-MavenCmd {
  $cmd = Join-Path $MavenHome "bin\mvn.cmd"
  if (Test-Path $cmd) { return $cmd }
  return $null
}

function Get-Mysqld {
  $exe = Join-Path $MysqlHome "bin\mysqld.exe"
  if (Test-Path $exe) { return $exe }
  return $null
}

function Get-MysqlClient {
  $exe = Join-Path $MysqlHome "bin\mysql.exe"
  if (Test-Path $exe) { return $exe }
  return $null
}

function Get-MysqlAdmin {
  $exe = Join-Path $MysqlHome "bin\mysqladmin.exe"
  if (Test-Path $exe) { return $exe }
  return $null
}

function Write-MavenSettings {
  if (-not (Test-Path $Tools)) { New-Item -ItemType Directory -Force -Path $Tools | Out-Null }
  $repo = (Join-Path $Tools "m2") -replace "\\", "/"
  $xml = @"
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0">
  <localRepository>$repo</localRepository>
</settings>
"@
  [IO.File]::WriteAllText((Join-Path $Tools "maven-settings.xml"), $xml, (New-Object Text.UTF8Encoding($false)))
}

function Write-MysqlIni {
  $ini = Join-Path $Data "mysql\my.ini"
  $mysqlDir = Split-Path $ini -Parent
  if (-not (Test-Path $mysqlDir)) { New-Item -ItemType Directory -Force -Path $mysqlDir | Out-Null }
  $basedir = $MysqlHome -replace "\\", "/"
  $datadir = (Join-Path $mysqlDir "data") -replace "\\", "/"
  $errorLog = (Join-Path $mysqlDir "error.log") -replace "\\", "/"
  $pidFile = (Join-Path $mysqlDir "mysqld.pid") -replace "\\", "/"
  $tmpdir = Join-Path $mysqlDir "tmp"
  if (-not (Test-Path $tmpdir)) { New-Item -ItemType Directory -Force -Path $tmpdir | Out-Null }
  $tmpdir = $tmpdir -replace "\\", "/"
  $text = @"
[mysqld]
basedir=$basedir
datadir=$datadir
tmpdir=$tmpdir
port=3307
bind-address=127.0.0.1
mysqlx=0
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-time-zone=+08:00
log-error=$errorLog
pid-file=$pidFile
innodb_buffer_pool_size=128M
max_connections=50
[client]
port=3307
default-character-set=utf8mb4
"@
  [IO.File]::WriteAllText($ini, $text, (New-Object Text.UTF8Encoding($false)))
  return $ini
}

function Invoke-Mysql([string[]]$Arguments, [string]$Password = "fuxiao123") {
  $client = Get-MysqlClient
  if (-not $client) { throw "MySQL 客户端不存在，请先运行 scripts/local-setup.ps1" }
  $old = $env:MYSQL_PWD
  $env:MYSQL_PWD = $Password
  try {
    & $client "--host=127.0.0.1" "--port=3307" "--user=root" "--protocol=tcp" "--default-character-set=utf8mb4" @Arguments
    return $LASTEXITCODE
  } finally {
    $env:MYSQL_PWD = $old
  }
}

function Get-MysqlScalar([string]$Sql) {
  $client = Get-MysqlClient
  if (-not $client) { return $null }
  $old = $env:MYSQL_PWD
  $env:MYSQL_PWD = "fuxiao123"
  try {
    $output = & $client "--host=127.0.0.1" "--port=3307" "--user=root" "--protocol=tcp" "--skip-column-names" "--batch" "--execute=$Sql" 2>$null
    if ($LASTEXITCODE -ne 0) { return $null }
    return (($output | Select-Object -First 1) -as [string]).Trim()
  } finally {
    $env:MYSQL_PWD = $old
  }
}

function Test-MysqlPassword([string]$Password) {
  $client = Get-MysqlClient
  if (-not $client) { return $false }
  $old = $env:MYSQL_PWD
  $env:MYSQL_PWD = $Password
  try {
    & $client "--host=127.0.0.1" "--port=3307" "--user=root" "--protocol=tcp" "--execute=SELECT 1" 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
  } finally {
    $env:MYSQL_PWD = $old
  }
}

function Start-DetachedScript([string]$ScriptPath, [string]$Name) {
  $shell = Join-Path $PSHOME "powershell.exe"
  if (-not (Test-Path $shell)) { $shell = "powershell.exe" }
  $outLog = Join-Path $Logs "$Name.out.log"
  $errLog = Join-Path $Logs "$Name.err.log"
  $process = Start-Process -FilePath $shell `
    -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $ScriptPath) `
    -WorkingDirectory $Root -WindowStyle Hidden `
    -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
  Set-Content -Path (Join-Path $Pids "$Name.pid") -Value $process.Id -Encoding ASCII
  Write-Info "$Name 已启动（PID $($process.Id)），日志：$outLog"
  return $process
}

function Start-Mysql {
  if (Test-Port 3307) {
    Write-Info "MySQL 已在 3307 端口运行"
    return
  }
  $mysqld = Get-Mysqld
  if (-not $mysqld) { throw "没有找到 MySQL，请先运行 scripts/local-setup.ps1" }
  $ini = Write-MysqlIni
  $mysqlDir = Join-Path $Data "mysql"
  $process = Start-Process -FilePath $mysqld `
    -ArgumentList @("--defaults-file=$ini") -WorkingDirectory $MysqlHome -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $mysqlDir "stdout.log") `
    -RedirectStandardError (Join-Path $mysqlDir "stderr.log") -PassThru
  Set-Content -Path (Join-Path $Pids "mysql.pid") -Value $process.Id -Encoding ASCII
  if (-not (Wait-Port 3307 45)) {
    $tail = Get-Content (Join-Path $mysqlDir "error.log") -Tail 20 -ErrorAction SilentlyContinue
    throw "MySQL 启动失败。`n$($tail -join "`n")"
  }
  Write-Info "MySQL 已启动（PID $($process.Id)，端口 3307）"
}

function Start-Backend {
  if (Test-Port 8080) {
    Write-Info "后端已在 8080 端口运行"
    return
  }
  $maven = Get-MavenCmd
  if (-not $maven) { throw "没有找到 Maven，请先运行 scripts/local-setup.ps1" }
  Start-DetachedScript (Join-Path $PSScriptRoot "run-backend.ps1") "backend" | Out-Null
  Write-Info "等待后端编译并启动（首次会下载依赖，可能需要几分钟）……"
  if (-not (Wait-Http "http://127.0.0.1:8080/api/public/site" 600)) {
    $tail = Get-Content (Join-Path $Logs "backend.out.log") -Tail 30 -ErrorAction SilentlyContinue
    throw "后端启动失败，日志：$($Logs)\backend.out.log`n$($tail -join "`n")"
  }
  Write-Info "后端已就绪：http://127.0.0.1:8080"
}

function Start-Frontend {
  if (Test-Port 5174) {
    Write-Info "管理台已在 5174 端口运行"
    return
  }
  if (-not (Test-Path (Join-Path $Root "admin-web\node_modules\vue\package.json"))) {
    throw "前端依赖还没有安装，请先运行 scripts/local-setup.ps1"
  }
  Start-DetachedScript (Join-Path $PSScriptRoot "run-frontend.ps1") "frontend" | Out-Null
  if (-not (Wait-Http "http://127.0.0.1:5174/" 90)) {
    $tail = Get-Content (Join-Path $Logs "frontend.out.log") -Tail 30 -ErrorAction SilentlyContinue
    throw "管理台启动失败，日志：$($Logs)\frontend.out.log`n$($tail -join "`n")"
  }
  Write-Info "管理台已就绪：http://127.0.0.1:5174"
}

function Start-Blog {
  if (Test-Port 3100) {
    Write-Info "博客已在 3100 端口运行"
    return $true
  }
  $blogRoot = Split-Path -Parent $Root
  if (-not (Test-Path (Join-Path $blogRoot "node_modules\next"))) {
    Write-Info "博客依赖不存在，跳过启动；封面图可能显示为空白。"
    return $false
  }
  Start-DetachedScript (Join-Path $PSScriptRoot "run-blog.ps1") "blog" | Out-Null
  if (-not (Wait-Http "http://127.0.0.1:3100/" 120)) {
    Write-Info "博客没有在预期时间内启动，管理台仍可使用（媒体图片可能缺失）。"
    return $false
  }
  Write-Info "博客已就绪：http://127.0.0.1:3100"
  return $true
}

function Show-Status {
  Write-Host ""
  Write-Host "  服务状态" -ForegroundColor White
  foreach ($item in @(
      @{ name = "MySQL"; port = 3307; url = "" },
      @{ name = "后端"; port = 8080; url = "http://127.0.0.1:8080/api/public/site" },
      @{ name = "管理台"; port = 5174; url = "http://127.0.0.1:5174/" },
      @{ name = "博客"; port = 3100; url = "http://127.0.0.1:3100/" }
    )) {
    $state = if (Test-Port $item.port) { "运行中" } else { "未启动" }
    $color = if ($state -eq "运行中") { "Green" } else { "DarkGray" }
    Write-Host ("  {0,-6} 端口 {1,-5} {2}" -f $item.name, $item.port, $state) -ForegroundColor $color
  }
  Write-Host ""
}
