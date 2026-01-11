#!/bin/bash

# Next.js Frontend Deployment Script
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
EC2_PATH="/var/www/CelebrationGarden/frontend"
FRONTEND_DIR="frontend"
SSH_KEY="${SSH_KEY:-~/.ssh/CelebrationGarden.pem}"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Next.js Frontend Deployment (Local Build) ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🚀 Starting Next.js Frontend Deployment...${NC}"
echo -e "${YELLOW}📍 Building locally, uploading .next to EC2${NC}"
echo -e "${YELLOW}💡 Assumes npm install --production already ran on EC2${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Error: $FRONTEND_DIR directory not found${NC}"
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

cd "$FRONTEND_DIR"

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf .next
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
echo -e "${YELLOW}🔨 Building Next.js for production...${NC}"
npm run build

if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build failed: .next folder not created${NC}"
    exit 1
fi

# Verify build output
if [ ! -f ".next/BUILD_ID" ]; then
    echo -e "${RED}❌ Build failed: BUILD_ID not found${NC}"
    echo "   Expected: .next/BUILD_ID"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"
echo ""

# Step 4: Prepare files for upload
echo -e "${YELLOW}📁 Preparing files for upload...${NC}"

# Create temporary directory for files to upload
TEMP_DIR=$(mktemp -d)

# Copy build output (.next folder)
cp -r .next "$TEMP_DIR/"

# Copy essential files
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/" 2>/dev/null || true

# Copy config files (needed for runtime)
cp next.config.js "$TEMP_DIR/" 2>/dev/null || true
cp next-env.d.ts "$TEMP_DIR/" 2>/dev/null || true
cp tsconfig.json "$TEMP_DIR/" 2>/dev/null || true
cp tailwind.config.js "$TEMP_DIR/" 2>/dev/null || true
cp postcss.config.js "$TEMP_DIR/" 2>/dev/null || true

# Copy public folder (for static assets, images, etc.)
cp -r public "$TEMP_DIR/" 2>/dev/null || true

# Copy app directory structure (needed for Next.js runtime)
# Note: We copy the structure but Next.js will use the built .next folder
# Some files might be needed for runtime (like middleware, etc.)
if [ -d "app" ]; then
    # Copy app directory (Next.js may need some files at runtime)
    cp -r app "$TEMP_DIR/" 2>/dev/null || true
fi

# Copy components and lib directories (may be needed for runtime)
if [ -d "components" ]; then
    cp -r components "$TEMP_DIR/" 2>/dev/null || true
fi

if [ -d "lib" ]; then
    cp -r lib "$TEMP_DIR/" 2>/dev/null || true
fi

# Copy other essential files
cp metadata.json "$TEMP_DIR/" 2>/dev/null || true
cp README.md "$TEMP_DIR/" 2>/dev/null || true

echo -e "${GREEN}✅ Files prepared${NC}"
echo ""

# Step 5: Fix permissions on EC2 server
echo -e "${YELLOW}🔧 Fixing permissions on EC2 server...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Create directory if it doesn't exist
    sudo mkdir -p /var/www/CelebrationGarden/frontend
    
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
        --exclude 'node_modules' \
        --exclude '.env*' \
        "$TEMP_DIR/" \
        "$EC2_USER@$EC2_HOST:$EC2_PATH/"
else
    # Fallback to scp if rsync not available
    echo "   Using SCP (rsync not available)..."
    echo "   Uploading files..."
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/.next" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/"
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/package-lock.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/next.config.js" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/tsconfig.json" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/tailwind.config.js" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" "$TEMP_DIR/postcss.config.js" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/public" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/app" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/components" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
    scp -i "$SSH_KEY_EXPANDED" -r "$TEMP_DIR/lib" "$EC2_USER@$EC2_HOST:$EC2_PATH/" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Upload completed${NC}"
echo ""

# Step 7: Verify deployment on server
echo -e "${YELLOW}🔍 Verifying deployment on server...${NC}"
ssh -i "$SSH_KEY_EXPANDED" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd /var/www/CelebrationGarden/frontend
    
    echo "Checking critical files..."
    echo ""
    
    # Check .next folder
    if [ -d ".next" ] && [ -n "$(ls -A .next)" ]; then
        echo "✅ .next folder found ($(du -sh .next | cut -f1))"
        if [ -f ".next/BUILD_ID" ]; then
            echo "✅ .next/BUILD_ID found (Next.js build identifier)"
        fi
        if [ -d ".next/standalone" ] || [ -d ".next/server" ]; then
            echo "✅ Next.js server files found"
        fi
    else
        echo "❌ ERROR: .next folder missing or empty!"
    fi
    
    # Check node_modules (should exist from npm install --production on EC2)
    if [ -d "node_modules" ] && [ -n "$(ls -A node_modules)" ]; then
        echo "✅ node_modules found on server"
        echo "   (Assumes npm install --production already ran on EC2)"
    else
        echo "⚠️  Warning: node_modules not found"
        echo "   Make sure to run 'npm install --production' on EC2 first"
    fi
    
    # Check package.json
    if [ -f "package.json" ]; then
        echo "✅ package.json found"
    else
        echo "❌ ERROR: package.json missing!"
    fi
    
    # Check next.config.js
    if [ -f "next.config.js" ]; then
        echo "✅ next.config.js found"
    else
        echo "⚠️  Warning: next.config.js not found (may be optional)"
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
echo "  ✅ Built locally (.next folder)"
echo "  ✅ Fixed permissions on EC2"
echo "  ✅ Uploaded build files to server (.next, public, config, etc.)"
echo "  ✅ Assumes npm install --production already ran on EC2"
echo ""
echo -e "${YELLOW}Next steps on EC2:${NC}"
echo "  1. Ensure npm install --production has been run:"
echo "     cd /var/www/CelebrationGarden/frontend"
echo "     npm install --production"
echo ""
echo "  2. Ensure .env.production file is configured:"
echo "     /var/www/CelebrationGarden/frontend/.env.production"
echo "     (Should contain NEXT_PUBLIC_STRAPI_URL, etc.)"
echo ""
echo "  3. Restart Next.js with PM2:"
echo "     pm2 restart nextjs"
echo ""
echo "  4. Check logs if needed:"
echo "     pm2 logs nextjs"
echo ""
echo -e "${GREEN}💡 Note: Build was done locally, only .next folder and essential files uploaded to EC2${NC}"
echo ""
