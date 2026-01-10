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

# Store absolute path to CMS directory
CMS_DIR_ABS="$PROJECT_ROOT/backend/celebration-garden-cms"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Strapi CMS Deployment (Local Build)   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🚀 Starting Strapi CMS Deployment...${NC}"
echo -e "${YELLOW}📍 Building locally, deploying to EC2${NC}"
echo -e "${YELLOW}💡 No RAM needed on EC2 - perfect for low-RAM instances!${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [ ! -d "$CMS_DIR_ABS" ]; then
    echo -e "${RED}❌ Error: $CMS_DIR_ABS directory not found${NC}"
    echo "   Current directory: $(pwd)"
    echo "   Expected project root: $PROJECT_ROOT"
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

cd "$CMS_DIR_ABS"

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

# Step 2b: Prepare production node_modules locally (to avoid npm install on EC2)
echo -e "${YELLOW}📦 Preparing production node_modules locally...${NC}"
echo "   (This avoids npm install on low-RAM EC2 instance)"
PROD_NODE_MODULES=$(mktemp -d)
# Copy package files from CMS directory (we're currently in CMS_DIR_ABS)
cp "$CMS_DIR_ABS/package.json" "$PROD_NODE_MODULES/"
cp "$CMS_DIR_ABS/package-lock.json" "$PROD_NODE_MODULES/" 2>/dev/null || true
cd "$PROD_NODE_MODULES"
echo "   Installing production dependencies locally..."
npm install --production --silent --no-audit --no-fund
cd "$CMS_DIR_ABS"  # Return to CMS directory using absolute path
echo -e "${GREEN}✅ Production dependencies prepared${NC}"
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

# Copy production node_modules (uploading to avoid npm install on EC2)
echo "   Copying production node_modules..."
# Exclude better-sqlite3 since it's platform-specific (you're using PostgreSQL anyway)
if [ -d "$PROD_NODE_MODULES/node_modules" ]; then
    cp -r "$PROD_NODE_MODULES/node_modules" "$TEMP_DIR/" 2>/dev/null || true
    # Remove better-sqlite3 if it exists (platform-specific, not needed for PostgreSQL)
    rm -rf "$TEMP_DIR/node_modules/better-sqlite3" 2>/dev/null || true
    echo "   ✅ Production node_modules included (better-sqlite3 excluded - using PostgreSQL)"
else
    echo -e "${YELLOW}⚠️  Warning: Could not prepare node_modules${NC}"
fi

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
    rm -rf "$PROD_NODE_MODULES"
    rm -rf "$TEMP_DIR"
    exit 1
fi

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

# Check disk space on EC2 before uploading
echo -e "${YELLOW}🔍 Checking EC2 disk space...${NC}"
EC2_DISK_AVAILABLE=$(ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" "df -BG / | tail -1 | awk '{print \$4}' | sed 's/G//'")
echo "   Available space on EC2: ${EC2_DISK_AVAILABLE}GB"

# Estimate node_modules size
NODE_MODULES_SIZE=$(du -sm "$PROD_NODE_MODULES/node_modules" 2>/dev/null | cut -f1 || echo "0")
echo "   node_modules size: ~${NODE_MODULES_SIZE}MB"

if [ "$EC2_DISK_AVAILABLE" -lt "$((NODE_MODULES_SIZE / 1024 + 1))" ]; then
    echo -e "${RED}❌ Not enough disk space on EC2!${NC}"
    echo "   Available: ${EC2_DISK_AVAILABLE}GB"
    echo "   Needed: ~$((NODE_MODULES_SIZE / 1024 + 1))GB for node_modules"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  1. Free up space on EC2 first: ./deployment/scripts/emergency-disk-cleanup.sh"
    echo "  2. Or cancel this and use a different approach"
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Free up space and try again."
        rm -rf "$TEMP_DIR"
        rm -rf "$PROD_NODE_MODULES"
        exit 1
    fi
fi
echo ""

# Check if rsync is available, otherwise use scp
if command -v rsync &> /dev/null; then
    # Upload all files including node_modules (no npm install needed on EC2!)
    echo "   Uploading files (including node_modules - no npm install on EC2)..."
    echo "   This may take 5-15 minutes due to node_modules size..."
    echo "   (You can check progress in another terminal with: ./deployment/scripts/check-upload-progress.sh)"
    echo ""
    
    # Use rsync with timeout and better error handling
    rsync -avz --progress --timeout=300 \
        -e "ssh -i $SSH_KEY_EXPANDED -o ServerAliveInterval=60" \
        --exclude '.tmp' \
        --exclude '.git' \
        --exclude '*.log' \
        "$TEMP_DIR/" \
        "$EC2_USER@$EC2_HOST:$EC2_PATH/" || {
        echo -e "${RED}❌ Upload failed or timed out${NC}"
        echo "   This might be due to:"
        echo "   - Disk space full on EC2"
        echo "   - Network issues"
        echo "   - Upload taking too long"
        echo ""
        echo "   Try:"
        echo "   1. Free up disk space on EC2"
        echo "   2. Check network connection"
        echo "   3. Or use a different deployment method"
        rm -rf "$TEMP_DIR"
        rm -rf "$PROD_NODE_MODULES"
        exit 1
    }
else
    # Fallback to scp if rsync not available
    echo "   Using SCP (rsync not available)..."
    echo "   Uploading files (this will take longer)..."
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/dist" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package-lock.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/config" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/public" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/database" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/types" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/node_modules" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Upload completed${NC}"
echo ""

# Step 7: Verify node_modules on server (NO npm install needed!)
echo -e "${YELLOW}🔍 Verifying deployment on server...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /var/www/CelebrationGarden/backend/celebration-garden-cms
    
    # Check if node_modules exists
    if [ -d "node_modules" ] && [ -n "$(ls -A node_modules)" ]; then
        echo "✅ node_modules found on server"
        echo "   (No npm install needed - dependencies were uploaded)"
        echo "   Count: $(ls -1 node_modules | wc -l) packages"
    else
        echo "⚠️  Warning: node_modules not found or empty"
        echo "   This should not happen if upload completed successfully"
    fi
ENDSSH

echo -e "${GREEN}✅ Deployment verified${NC}"
echo -e "${GREEN}💡 Zero RAM/CPU usage - no npm install on EC2!${NC}"
echo ""

# Step 7b: Copy built admin panel files (must be after npm install)
echo -e "${YELLOW}📦 Copying locally-built admin panel to server...${NC}"
if [ -d "node_modules/@strapi/admin/dist" ]; then
    # Ensure the directory exists on server (it should after npm install)
    ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" "mkdir -p $EC2_PATH/node_modules/@strapi/admin/dist" 2>/dev/null || true
    
    # Copy the entire built admin dist directory
    if command -v rsync &> /dev/null; then
        rsync -avz --progress \
            -e "ssh -i $SSH_KEY_EXPANDED" \
            "$TEMP_DIR/node_modules/@strapi/admin/dist/" \
            "$EC2_USER@$EC2_HOST:$EC2_PATH/node_modules/@strapi/admin/dist/"
    else
        # Fallback to scp if rsync not available
        echo "   Using SCP (rsync not available)..."
        scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/node_modules/@strapi/admin/dist/" "$EC2_USER@$EC2_HOST:$EC2_PATH/node_modules/@strapi/admin/dist/"
    fi
    
    echo -e "${GREEN}✅ Locally-built admin panel copied to server${NC}"
    echo ""
else
    echo -e "${RED}❌ Error: Built admin panel files not found in temp directory!${NC}"
    echo "   This should not happen if the build completed successfully."
    echo "   Cleaning up temp directory..."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Step 8: Cleanup
echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"
rm -rf "$PROD_NODE_MODULES"
echo -e "${GREEN}✅ Cleanup completed${NC}"
echo ""

# Step 9: Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Deployment Completed Successfully!   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "  ✅ Built locally (backend + admin panel)"
echo "  ✅ Prepared production dependencies locally"
echo "  ✅ Fixed permissions on EC2"
echo "  ✅ Copied all files to server (including node_modules)"
echo "  ✅ NO npm install on EC2 (zero RAM/CPU usage!)"
echo "  ✅ Copied locally-built admin panel"
echo ""
echo -e "${GREEN}💡 Note: better-sqlite3 was excluded (you're using PostgreSQL)${NC}"
echo ""
echo -e "${YELLOW}Next steps on EC2:${NC}"
echo "  1. Ensure .env file is configured:"
echo "     /var/www/CelebrationGarden/backend/celebration-garden-cms/.env"
echo ""
echo "  2. Restart Strapi with PM2:"
echo "     pm2 restart strapi"
echo ""
echo "  3. Check logs if needed:"
echo "     pm2 logs strapi"
echo ""
echo -e "${GREEN}💡 Note: No building was done on EC2 - everything was built locally!${NC}"
echo -e "${GREEN}💡 Perfect for low-RAM EC2 instances (t2.micro, t3.micro)${NC}"
echo ""