# PowerShell script to prepare for deployment
Write-Host "🚀 Preparing Shufi Barcode App for Cloud Deployment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📝 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add all files
Write-Host "📁 Adding files to Git..." -ForegroundColor Yellow
git add .

# Commit changes
$commitMessage = "Prepare for cloud deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host ""
Write-Host "✅ Ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository: https://github.com/new" -ForegroundColor White
Write-Host "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/shufi-barcode-app.git" -ForegroundColor White
Write-Host "3. Push code: git push -u origin main" -ForegroundColor White
Write-Host "4. Deploy to Railway and Vercel (see DEPLOYMENT.md)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full deployment guide: See DEPLOYMENT.md file" -ForegroundColor Magenta