#!/bin/bash

# PM2 Setup Script for Strapi
# Run this script on your EC2 server to set up PM2 for Strapi
# Usage: ./setup-pm2-strapi.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up PM2 for Strapi...${NC}"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 PM2 not found. Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 is already installed${NC}"
fi
echo ""

# Create log directory
echo -e "${YELLOW}📁 Creating PM2 log directory...${NC}"
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
echo -e "${GREEN}✅ Log directory created${NC}"
echo ""

# Check if we're in the right directory
STRAPI_DIR="/var/www/celebration-garden-cms"
if [ ! -d "$STRAPI_DIR" ]; then
    echo -e "${RED}❌ Error: Strapi directory not found at $STRAPI_DIR${NC}"
    exit 1
fi

cd "$STRAPI_DIR"

# Check if PM2 config exists in deployment directory
PM2_CONFIG="~/CelebrationGarden/deployment/pm2-ecosystem.config.js"
if [ ! -f "$PM2_CONFIG" ]; then
    # Try alternative location
    PM2_CONFIG="./deployment/pm2-ecosystem.config.js"
    if [ ! -f "$PM2_CONFIG" ]; then
        echo -e "${RED}❌ Error: PM2 config file not found${NC}"
        echo "   Expected locations:"
        echo "   - /var/www/CelebrationGarden/deployment/pm2-ecosystem.config.js"
        echo "   - ./deployment/pm2-ecosystem.config.js"
        exit 1
    fi
fi

# Copy PM2 config to a convenient location
echo -e "${YELLOW}📋 Copying PM2 config...${NC}"
cp "$PM2_CONFIG" /var/www/pm2-ecosystem.config.js
echo -e "${GREEN}✅ PM2 config copied to /var/www/pm2-ecosystem.config.js${NC}"
echo ""

# Stop any existing Strapi process if running
echo -e "${YELLOW}🛑 Stopping any existing Strapi process...${NC}"
pm2 stop strapi 2>/dev/null || true
pm2 delete strapi 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned up existing processes${NC}"
echo ""

# Start Strapi with PM2
echo -e "${YELLOW}🚀 Starting Strapi with PM2...${NC}"
cd /var/www
pm2 start pm2-ecosystem.config.js --only strapi

# Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"
echo ""

# Setup PM2 to start on boot
echo -e "${YELLOW}⚙️  Setting up PM2 to start on boot...${NC}"
echo "   Run the command that PM2 outputs below:"
echo ""
pm2 startup
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Copy and run the command shown above to enable PM2 on boot${NC}"
echo ""

# Show status
echo -e "${GREEN}✅ PM2 setup completed!${NC}"
echo ""
echo -e "${GREEN}📊 Current PM2 status:${NC}"
pm2 status
echo ""
echo "Useful commands:"
echo "  - View logs:        pm2 logs strapi"
echo "  - Restart Strapi:   pm2 restart strapi"
echo "  - Stop Strapi:      pm2 stop strapi"
echo "  - View all logs:    pm2 logs"
echo "  - Monitor:          pm2 monit"
echo ""
