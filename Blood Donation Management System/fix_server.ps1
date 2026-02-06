# Stop all node processes
Write-Host "`n=== Stopping all Node.js processes ===" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Regenerate Prisma Client
Write-Host "`n=== Regenerating Prisma Client ===" -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Prisma client generated successfully!" -ForegroundColor Green
    Write-Host "`nNow run: npm run server" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Prisma generation failed" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
}
