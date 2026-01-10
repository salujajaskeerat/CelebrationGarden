#!/bin/bash

# Strapi CMS Deployment Script
# Builds locally (to save time) and deploys to EC2
# IMPORTANT: This script builds everything locally and only installs production
# dependencies on EC2. No building happens on the server.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="celebration-garden"
EC2_USER="ubuntu"
EC2_PATH="/var/www/CelebrationGarden/backend/celebration-garden-cms"
CMS_DIR="backend/celebration-garden-cms"
SSH_KEY="~/.ssh/CelebrationGarden.pem"

echo -e "${GREEN}🚀 Starting Strapi CMS Deployment...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "$CMS_DIR" ]; then
    echo -e "${RED}❌ Error: $CMS_DIR directory not found${NC}"
    echo "   Please run this script from the CelebrationGarden root directory"
    exit 1
fi

cd "$CMS_DIR"

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf dist
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Step 2: Install dependencies (if needed)
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
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

# Step 4: Create temporary directory for files to upload
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}📁 Preparing files for upload...${NC}"

# Copy build output
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

# Copy built admin panel files (critical for admin access)
# This MUST exist since we're building locally to avoid building on EC2
if [ -d "node_modules/@strapi/admin/dist" ]; then
    echo "   Copying built admin panel files..."
    mkdir -p "$TEMP_DIR/node_modules/@strapi/admin"
    cp -r node_modules/@strapi/admin/dist "$TEMP_DIR/node_modules/@strapi/admin/" 2>/dev/null || true
    echo "   ✅ Admin panel files included"
else
    echo -e "${RED}❌ Error: Built admin panel not found!${NC}"
    echo "   The admin panel must be built locally before deployment."
    echo "   Make sure 'npm run build' completed successfully."
    exit 1
fi

echo -e "${GREEN}✅ Files prepared${NC}"
echo ""

# Step 5: Fix permissions on EC2 server
echo -e "${YELLOW}🔧 Fixing permissions on EC2 server...${NC}"
SSH_KEY_EXPANDED=$(eval echo "$SSH_KEY")

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
    # Upload main files (excluding node_modules)
    rsync -avz --progress \
        -e "ssh -i $SSH_KEY_EXPANDED" \
        --exclude 'node_modules' \
        --exclude '.tmp' \
        --exclude '.git' \
        --exclude '*.log' \
        "$TEMP_DIR/" \
        "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    
    # Note: Admin panel files will be copied after npm install (see Step 7)
else
    # Fallback to scp if rsync not available
    echo "   Using SCP (rsync not available)..."
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/dist" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package-lock.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/config" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/public" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/database" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/types" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    
    # Note: Admin panel files will be copied after npm install (see Step 7)
fi

echo -e "${GREEN}✅ Upload completed${NC}"
echo ""

# Step 7: Install production dependencies on server
echo -e "${YELLOW}📦 Installing production dependencies on server...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    # Install production dependencies
    npm install --production
    
    echo "✅ Dependencies installed"
ENDSSH

echo -e "${GREEN}✅ Dependencies installed on server${NC}"
echo ""

# Step 7b: Copy built admin panel files (must be after npm install)
# This replaces the admin build that npm install created with our locally built version
echo -e "${YELLOW}📦 Copying locally-built admin panel to server...${NC}"
if [ -d "$TEMP_DIR/node_modules/@strapi/admin/dist" ]; then
    # Ensure the directory exists on server (it should after npm install)
    ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" "mkdir -p $EC2_PATH/node_modules/@strapi/admin/dist" 2>/dev/null || true
    
    # Copy the entire built admin dist directory
    rsync -avz --progress \
        -e "ssh -i $SSH_KEY_EXPANDED" \
        "$TEMP_DIR/node_modules/@strapi/admin/dist/" \
        "$EC2_USER@$EC2_HOST:$EC2_PATH/node_modules/@strapi/admin/dist/"
    
    echo -e "${GREEN}✅ Locally-built admin panel copied to server${NC}"
    echo ""
else
    echo -e "${RED}❌ Error: Built admin panel files not found in temp directory!${NC}"
    echo "   This should not happen if the build completed successfully."
    exit 1
fi

# Step 8: Cleanup
rm -rf "$TEMP_DIR"

# Step 9: Summary
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Built locally (backend + admin panel)"
echo "  ✅ Fixed permissions on EC2"
echo "  ✅ Copied all files to server"
echo "  ✅ Installed production dependencies"
echo "  ✅ Copied locally-built admin panel"
echo ""
echo "Next steps on EC2:"
echo "  1. Ensure .env file is configured with production settings"
echo "  2. Restart Strapi with PM2: pm2 restart strapi"
echo "  3. Check logs: pm2 logs strapi"
echo ""
echo "Note: No building was done on EC2 - everything was built locally! 🚀"
echo ""