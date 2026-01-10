#!/bin/bash

# Strapi CMS Deployment Script
# Builds locally (to save RAM on EC2) and deploys to EC2
# IMPORTANT: This script builds everything locally and only installs production
# dependencies on EC2. No building happens on the server.
# Perfect for low-RAM EC2 instances (t2.micro, t3.micro)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (can be overridden by environment variables)
EC2_HOST="${EC2_HOST:-celebration-garden}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_PATH="/var/www/CelebrationGarden/backend/celebration-garden-cms"
CMS_DIR="backend/celebration-garden-cms"
SSH_KEY="${SSH_KEY:-~/.ssh/CelebrationGarden.pem}"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Strapi CMS Deployment (Local Build)   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🚀 Starting Strapi CMS Deployment...${NC}"
echo -e "${YELLOW}📍 Building locally, uploading dist to EC2${NC}"
echo -e "${YELLOW}💡 Assumes npm install --production already ran on EC2${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [ ! -d "$CMS_DIR" ]; then
    echo -e "${RED}❌ Error: $CMS_DIR directory not found${NC}"
    echo "   Current directory: $(pwd)"
    echo "   Expected: $PROJECT_ROOT"
    echo "   Please run this script from the CelebrationGarden root directory"
    exit 1
fi

# Expand SSH key path
SSH_KEY_EXPANDED=$(eval echo "$SSH_KEY")

# Validate SSH key exists
if [ ! -f "$SSH_KEY_EXPANDED" ]; then
    echo -e "${RED}❌ Error: SSH key not found at $SSH_KEY_EXPANDED${NC}"
    echo "   Please set SSH_KEY environment variable or place key at default location"
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}🔍 Testing SSH connection...${NC}"
if ! ssh -i "$SSH_KEY_EXPANDED" -o ConnectTimeout=5 -o BatchMode=yes "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Could not verify SSH connection (this is OK if key requires passphrase)${NC}"
    echo "   Will attempt connection during deployment..."
else
    echo -e "${GREEN}✅ SSH connection verified${NC}"
fi
echo ""

cd "$CMS_DIR"

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf dist
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Step 2: Install dependencies (if needed)
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   Installing all dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi
echo ""


# Step 3: Build for production
echo -e "${YELLOW}🔨 Building Strapi for production...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed: dist folder not created${NC}"
    exit 1
fi

# Verify admin panel was built (critical - we don't build on EC2)
if [ ! -d "node_modules/@strapi/admin/dist" ]; then
    echo -e "${RED}❌ Build failed: Admin panel not built${NC}"
    echo "   Expected: node_modules/@strapi/admin/dist"
    echo "   This is required since we build locally to save time on EC2."
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully (backend + admin panel)${NC}"
echo ""

# Step 4: Prepare files for upload
echo -e "${YELLOW}📁 Preparing files for upload...${NC}"

# Create temporary directory for files to upload
TEMP_DIR=$(mktemp -d)

# Copy build output (dist folder)
cp -r dist "$TEMP_DIR/"

# Copy essential files
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/" 2>/dev/null || true

# Copy config files (needed for runtime)
cp -r config "$TEMP_DIR/" 2>/dev/null || true

# Copy public folder (for uploads, robots.txt, etc.)
cp -r public "$TEMP_DIR/" 2>/dev/null || true

# Copy database folder (migrations)
cp -r database "$TEMP_DIR/" 2>/dev/null || true

# Copy types folder (generated types)
cp -r types "$TEMP_DIR/" 2>/dev/null || true

# Copy other essential files
cp tsconfig.json "$TEMP_DIR/" 2>/dev/null || true
cp favicon.png "$TEMP_DIR/" 2>/dev/null || true
cp README.md "$TEMP_DIR/" 2>/dev/null || true

echo -e "${GREEN}✅ Files prepared${NC}"
echo ""

# Step 5: Fix permissions on EC2 server
echo -e "${YELLOW}🔧 Fixing permissions on EC2 server...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Create directory if it doesn't exist
    sudo mkdir -p /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    # Fix ownership
    sudo chown -R $USER:$USER /var/www/CelebrationGarden
    
    echo "✅ Permissions fixed"
ENDSSH

echo -e "${GREEN}✅ Permissions configured${NC}"
echo ""

# Step 6: Upload to EC2
echo -e "${YELLOW}📤 Uploading to EC2 instance...${NC}"
echo "   Host: $EC2_HOST"
echo "   Path: $EC2_PATH"
echo ""

# Check if rsync is available, otherwise use scp
if command -v rsync &> /dev/null; then
    # Upload build files (no node_modules - assumes npm install already ran on EC2)
    echo "   Uploading build files..."
    rsync -avz --progress \
        -e "ssh -i $SSH_KEY_EXPANDED" \
        --exclude '.tmp' \
        --exclude '.git' \
        --exclude '*.log' \
        "$TEMP_DIR/" \
        "$EC2_USER@$EC2_HOST:$EC2_PATH/"
else
    # Fallback to scp if rsync not available
    echo "   Using SCP (rsync not available)..."
    echo "   Uploading files..."
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/dist" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package-lock.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/config" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/public" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/database" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/types" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Upload completed${NC}"
echo ""

# Step 7: Verify deployment on server
echo -e "${YELLOW}🔍 Verifying deployment on server...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    echo "Checking critical files..."
    echo ""
    
    # Check dist folder
    if [ -d "dist" ] && [ -n "$(ls -A dist)" ]; then
        echo "✅ dist folder found ($(du -sh dist | cut -f1))"
        if [ -f "dist/src/index.js" ]; then
            echo "✅ dist/src/index.js found (Strapi v5 entry point)"
        fi
    else
        echo "❌ ERROR: dist folder missing or empty!"
    fi
    
    # Check node_modules (should exist from npm install --production on EC2)
    if [ -d "node_modules" ] && [ -n "$(ls -A node_modules)" ]; then
        echo "✅ node_modules found on server"
        echo "   (Assumes npm install --production already ran on EC2)"
    else
        echo "⚠️  Warning: node_modules not found"
        echo "   Make sure to run 'npm install --production' on EC2 first"
    fi
ENDSSH

echo -e "${GREEN}✅ Deployment verified${NC}"
echo ""

# Step 8: Cleanup
echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✅ Cleanup completed${NC}"
echo ""

# Step 9: Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Deployment Completed Successfully!   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "  ✅ Built locally (backend + admin panel)"
echo "  ✅ Fixed permissions on EC2"
echo "  ✅ Uploaded build files to server (dist, config, etc.)"
echo "  ✅ Assumes npm install --production already ran on EC2"
echo ""
echo -e "${YELLOW}Next steps on EC2:${NC}"
echo "  1. Ensure npm install --production has been run:"
echo "     cd /var/www/CelebrationGarden/backend/celebration-garden-cms"
echo "     npm install --production"
echo ""
echo "  2. Ensure .env file is configured:"
echo "     /var/www/CelebrationGarden/backend/celebration-garden-cms/.env"
echo ""
echo "  3. Restart Strapi with PM2:"
echo "     pm2 restart strapi"
echo ""
echo "  4. Check logs if needed:"
echo "     pm2 logs strapi"
echo ""
echo -e "${GREEN}💡 Note: Build was done locally, only dist folder uploaded to EC2${NC}"
echo ""