#!/bin/bash

# Emergency Script to Fix Stuck EC2 Instance
# Run this if npm install is stuck/hanging

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration (same as deploy-strapi.sh)
EC2_HOST="${EC2_HOST:-celebration-garden}"
EC2_USER="${EC2_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-~/.ssh/CelebrationGarden.pem}"
SSH_KEY_EXPANDED=$(eval echo "$SSH_KEY")

echo -e "${RED}🚨 Emergency EC2 Recovery Script${NC}"
echo ""

echo -e "${YELLOW}Step 1: Killing stuck npm/node processes...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    # Kill all npm/node processes
    pkill -9 npm 2>/dev/null || true
    pkill -9 node 2>/dev/null || true
    
    # Wait a moment
    sleep 2
    
    # Check if processes are gone
    if pgrep -x npm > /dev/null || pgrep -x node > /dev/null; then
        echo "⚠️  Some processes still running, forcing kill..."
        killall -9 npm 2>/dev/null || true
        killall -9 node 2>/dev/null || true
    fi
    
    echo "✅ Processes killed"
    
    # Check system resources
    echo ""
    echo "📊 System Status:"
    free -h
    echo ""
    df -h / | tail -1
ENDSSH

echo ""
echo -e "${YELLOW}Step 2: Cleaning up partial npm install...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    # Remove partial node_modules if it exists
    if [ -d "node_modules" ]; then
        echo "   Removing partial node_modules..."
        rm -rf node_modules
        echo "✅ Cleaned"
    fi
    
    # Clear npm cache to free space
    echo "   Clearing npm cache..."
    npm cache clean --force 2>/dev/null || true
    echo "✅ Cache cleared"
ENDSSH

echo ""
echo -e "${GREEN}✅ EC2 instance should be responsive now${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait a few minutes for the system to stabilize"
echo "2. Check if Strapi is still running: pm2 status"
echo "3. If needed, restart Strapi: pm2 restart strapi"
echo ""
echo -e "${RED}⚠️  IMPORTANT: The deployment script needs to be updated${NC}"
echo "   to avoid this issue in the future."
echo ""
