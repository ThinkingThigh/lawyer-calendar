# Lawyer Calendar Windows Application Launcher
Write-Host "Starting Lawyer Calendar Windows Application..." -ForegroundColor Green
Set-Location $PSScriptRoot
npx electron .
Write-Host "Application launched successfully" -ForegroundColor Green
