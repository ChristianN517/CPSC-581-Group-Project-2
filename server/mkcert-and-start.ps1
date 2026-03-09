<#
mkcert-and-start.ps1

Automates mkcert certificate generation (cert.pem/key.pem) in this `server/` folder
and starts `node index.js` with `SSL_CERT_PATH` and `SSL_KEY_PATH` set for the session.

Usage:
  From the `server` folder:
    .\mkcert-and-start.ps1
  Optionally provide an IP address:
    .\mkcert-and-start.ps1 -Ip 192.168.1.100
#>

param(
  [string]$Ip = ""
)

function Write-Err([string]$m) { Write-Host $m -ForegroundColor Red }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Helper script running in: $scriptDir"

# Check mkcert availability
try {
  mkcert -version > $null 2>&1
} catch {
  Write-Host "mkcert not found in PATH. Please install mkcert (choco or scoop)."
  Write-Host "See https://github.com/FiloSottile/mkcert for installation instructions."
  exit 1
}

if (-not $Ip -or $Ip -eq "") {
  try {
    $Ip = (Get-NetIPAddress -AddressFamily IPv4 |
           Where-Object { $_.IPAddress -notmatch '^(127|169)\.' } |
           Select-Object -First 1 -ExpandProperty IPAddress)
  } catch {
    $Ip = ""
  }
  if (-not $Ip) {
    $Ip = Read-Host "Enter the LAN IP you want to use (e.g. 192.168.1.100)"
  } else {
    Write-Host "Detected IP: $Ip"
    $use = Read-Host "Use this IP? (Y/n)"
    if ($use -and $use -match '^[nN]') {
      $Ip = Read-Host "Enter the LAN IP you want to use"
    }
  }
}

if (-not $Ip) { Write-Err "No IP provided. Aborting."; exit 1 }

Write-Host "Generating certificate for: $Ip and localhost"
mkcert -cert-file cert.pem -key-file key.pem $Ip localhost

if (-not (Test-Path (Join-Path $scriptDir 'cert.pem')) -or -not (Test-Path (Join-Path $scriptDir 'key.pem'))) {
  Write-Err "cert.pem or key.pem not found after mkcert. Aborting."
  exit 1
}

$env:SSL_CERT_PATH = Join-Path $scriptDir 'cert.pem'
$env:SSL_KEY_PATH  = Join-Path $scriptDir 'key.pem'

Write-Host "Starting server with SSL_CERT_PATH=$env:SSL_CERT_PATH"
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow

node index.js
