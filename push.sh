#!/bin/bash

# FastNet - Easy GitHub Push Script
# Usage: ./push.sh "Your commit message"

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a commit message"
  echo "Usage: ./push.sh \"Your commit message\""
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 FastNet Deployment Script${NC}"
echo ""

# Add all changes
echo -e "${BLUE}📦 Staging changes...${NC}"
git add .

# Commit with provided message
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$1"

# Check if commit was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Commit successful${NC}"
  
  # Push to GitHub
  echo -e "${BLUE}☁️  Pushing to GitHub...${NC}"
  git push origin main
  
  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}🎉 Your changes are now live on GitHub${NC}"
    echo ""
    echo -e "${BLUE}📍 Repository: https://github.com/Wirelextechs/fastnet-mtn-data${NC}"
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "   • If you're using Render, it will auto-deploy from GitHub"
    echo "   • If you're using Vercel, run: vercel --prod"
  else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
  fi
else
  echo -e "${BLUE}ℹ️  Nothing to commit (working tree clean)${NC}"
  echo -e "${BLUE}💡 No changes detected - skipping push${NC}"
fi
