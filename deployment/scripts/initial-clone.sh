#!/bin/bash

# Initial Repository Clone Script
# This script clones the repository directly to /var/www/CelebrationGarden
# Run this ONCE on your EC2 instance after running ec2-setup.sh
# Usage: ./initial-clone.sh YOUR_REPO_URL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if repository URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Repository URL required${NC}"
    echo ""
    echo "Usage: ./initial-clone.sh YOUR_REPO_URL"
    echo ""
    echo "Example:"
    echo "  ./initial-clone.sh https://github.com/yourusername/CelebrationGarden.git"
    echo "  ./initial-clone.sh git@github.com:yourusername/CelebrationGarden.git"
    echo ""
    exit 1
fi

REPO_URL="$1"

echo -e "${GREEN}🚀 Cloning repository to /var/www/CelebrationGarden...${NC}"
echo ""

# Check if directory already exists
if [ -d "/var/www/CelebrationGarden" ] && [ "$(ls -A /var/www/CelebrationGarden)" ]; then
    echo -e "${YELLOW}⚠️  /var/www/CelebrationGarden already exists and is not empty${NC}"
    read -p "Do you want to remove it and clone fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing directory..."
        rm -rf /var/www/CelebrationGarden
    else
        echo -e "${RED}❌ Aborted. Please remove /var/www/CelebrationGarden manually or choose a different location.${NC}"
        exit 1
    fi
fi

# Ensure parent directory exists and has correct permissions
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Clone repository
echo -e "${YELLOW}📥 Cloning repository...${NC}"
cd /var/www
git clone "$REPO_URL" CelebrationGarden

if [ ! -d "CelebrationGarden" ]; then
    echo -e "${RED}❌ Error: Clone failed${NC}"
    exit 1
fi

cd CelebrationGarden

echo -e "${GREEN}✅ Repository cloned successfully${NC}"
echo ""

# Check if deployment directory exists
if [ ! -d "deployment" ]; then
    echo -e "${YELLOW}⚠️  Warning: deployment directory not found${NC}"
    echo "   Make sure you cloned the correct repository"
    exit 1
fi

# Make deployment scripts executable
echo -e "${YELLOW}🔧 Making deployment scripts executable...${NC}"
chmod +x deployment/scripts/*.sh
echo -e "${GREEN}✅ Scripts are now executable${NC}"
echo ""

echo -e "${GREEN}🎉 Initial clone completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Set up PostgreSQL database:"
echo "   cd /var/www/CelebrationGarden/deployment/scripts"
echo "   ./setup-postgres.sh"
echo ""
echo "2. Configure environment variables:"
echo "   cd /var/www/CelebrationGarden/backend/celebration-garden-cms"
echo "   cp ../deployment/config/env-strapi-template.txt .env"
echo "   nano .env  # Update with your settings"
echo ""
echo "   cd /var/www/CelebrationGarden/frontend"
echo "   cp ../deployment/config/env-nextjs-template.txt .env.production"
echo "   nano .env.production  # Update with your settings"
echo ""
echo "3. Install dependencies and build:"
echo "   cd /var/www/CelebrationGarden/backend/celebration-garden-cms"
echo "   npm install"
echo "   npm run build"
echo ""
echo "   cd /var/www/CelebrationGarden/frontend"
echo "   npm install"
echo "   npm run build"
echo ""
echo "4. Set up PM2:"
echo "   cd /var/www/CelebrationGarden"
echo "   ./deployment/scripts/setup-pm2-strapi.sh"
echo ""
echo "5. For future updates, just run:"
echo "   cd /var/www/CelebrationGarden"
echo "   ./deployment/scripts/deploy-update.sh"
echo ""
