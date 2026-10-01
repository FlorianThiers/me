# Sync portfolio contact form env to Vercel (Preview + Production). Reads RESEND_API_KEY from E-stock .env.local.
# Usage: .\scripts\set-vercel-resend-contact-env.ps1

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

$estockEnv = 'C:\Users\flort\Projects\E-stock\.env.local'
if (-not (Test-Path $estockEnv)) {
  Write-Error "E-stock .env.local not found at $estockEnv"
}

$resendKey = $null
Get-Content $estockEnv | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY=(.+)$') { $resendKey = $Matches[1].Trim().Trim('"').Trim("'") }
}
if (-not $resendKey) { Write-Error 'RESEND_API_KEY missing in E-stock .env.local' }

# Until portfolio domain is on Resend, use verified sender (same as Brevo era).
$from = 'florthiers@gmail.com'
$to = 'florthiers@gmail.com'

function Add-VercelEnv($name, $value, $targets, [switch]$Sensitive) {
  foreach ($t in $targets) {
    Write-Host "Adding $name -> $t ..."
    $args = @('vercel', 'env', 'add', $name, $t, '--force', '--yes', '--value', $value)
    if ($Sensitive) { $args += '--sensitive' }
    & npx @args
    if ($LASTEXITCODE -ne 0) { throw "vercel env add failed for $name ($t)" }
  }
}

Add-VercelEnv 'RESEND_API_KEY' $resendKey @('preview', 'production') -Sensitive
Add-VercelEnv 'RESEND_FROM_EMAIL' $from @('preview', 'production')
Add-VercelEnv 'RESEND_TO_EMAIL' $to @('preview', 'production')
Add-VercelEnv 'VITE_EMAIL_SERVICE' 'resend' @('preview', 'production')

Write-Host 'Done. Push branch linked to Vercel project florian, then redeploy production.'
