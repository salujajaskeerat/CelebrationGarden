#!/bin/bash

# Quick Deployment Update Script
# This script pulls the latest changes and restarts services
# Run this from /var/www/CelebrationGarden after pushing new commits
# Usage: ./deployment/scripts/deploy-update.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment update...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "/var/www/CelebrationGarden" ]; then
    echo -e "${RED}❌ Error: /var/www/CelebrationGarden directory not found${NC}"
    echo "   Please run this script from /var/www/CelebrationGarden"
    exit 1
fi

cd /var/www/CelebrationGarden

# Check if git repository exists
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    echo "   Please clone your repository to /var/www/CelebrationGarden first"
    exit 1
fi

# Step 1: Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main || git pull origin master
echo -e "${GREEN}✅ Git pull completed${NC}"
echo ""

# Step 2: Update Strapi backend
if [ -d "backend/celebration-garden-cms" ]; then
    echo -e "${YELLOW}📦 Updating Strapi backend...${NC}"
    cd backend/celebration-garden-cms
    
    # Install/update dependencies
    npm install --production
    
    # Rebuild if package.json or package-lock.json changed in last commit
    # Go back to repo root to check git diff
    cd /var/www/CelebrationGarden
    if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "backend/celebration-garden-cms/package.json\|backend/celebration-garden-cms/package-lock.json"; then
        echo "   Package.json changed, rebuilding..."
        cd backend/celebration-garden-cms
        npm run build
    else
        echo "   No package.json changes detected, skipping rebuild"
    fi
    cd /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    echo -e "${GREEN}✅ Strapi backend updated${NC}"
    echo ""
    cd /var/www/CelebrationGarden
else
    echo -e "${YELLOW}⚠️  Strapi backend directory not found, skipping...${NC}"
    echo ""
fi

# Step 3: Update Next.js frontend
if [ -d "frontend" ]; then
    echo -e "${YELLOW}📦 Updating Next.js frontend...${NC}"
    cd frontend
    
    # Install/update dependencies
    npm install --production
    
    # Rebuild if package.json or package-lock.json changed in last commit
    # Go back to repo root to check git diff
    cd /var/www/CelebrationGarden
    if git diff HEAD~1 HEAD --name-only 2>/dev/null | grep -q "frontend/package.json\|frontend/package-lock.json"; then
        echo "   Package.json changed, rebuilding..."
        cd frontend
        npm run build
    else
        echo "   No package.json changes detected, skipping rebuild"
    fi
    cd /var/www/CelebrationGarden/frontend
    
    echo -e "${GREEN}✅ Next.js frontend updated${NC}"
    echo ""
    cd /var/www/CelebrationGarden
else
    echo -e "${YELLOW}⚠️  Frontend directory not found, skipping...${NC}"
    echo ""
fi

# Step 4: Restart PM2 services
echo -e "${YELLOW}🔄 Restarting PM2 services...${NC}"

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    # Restart Strapi if it's running
    if pm2 list | grep -q "strapi"; then
        pm2 restart strapi
        echo -e "${GREEN}✅ Strapi restarted${NC}"
    else
        echo -e "${YELLOW}⚠️  Strapi not running in PM2${NC}"
    fi
    
    # Restart Next.js if it's running
    if pm2 list | grep -q "nextjs"; then
        pm2 restart nextjs
        echo -e "${GREEN}✅ Next.js restarted${NC}"
    else
        echo -e "${YELLOW}⚠️  Next.js not running in PM2${NC}"
    fi
    
    # Save PM2 configuration
    pm2 save
else
    echo -e "${YELLOW}⚠️  PM2 not found, skipping service restart${NC}"
    echo "   You may need to start services manually"
fi

echo ""
echo -e "${GREEN}🎉 Deployment update completed!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Pulled latest changes from git"
echo "  ✅ Updated dependencies"
echo "  ✅ Rebuilt applications (if needed)"
echo "  ✅ Restarted PM2 services"
echo ""
echo "Check service status:"
echo "  pm2 status"
echo "  pm2 logs"
echo ""
