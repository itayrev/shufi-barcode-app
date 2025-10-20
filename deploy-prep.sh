#!/bin/bash

echo "🚀 Preparing Shufi Barcode App for Cloud Deployment"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Creating commit..."
git commit -m "Prepare for cloud deployment - $(date)"

echo "✅ Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository: https://github.com/new"
echo "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/shufi-barcode-app.git"
echo "3. Push code: git push -u origin main"
echo "4. Deploy to Railway and Vercel (see DEPLOYMENT.md)"
echo ""
echo "📖 Full deployment guide: See DEPLOYMENT.md file"