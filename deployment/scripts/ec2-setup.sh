#!/bin/bash

# EC2 Setup Script for Celebration Garden
# This script sets up the server environment for PostgreSQL, Strapi, and Next.js

set -e

echo "🚀 Starting EC2 setup for Celebration Garden..."
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js $node_version installed"
echo "✅ npm $npm_version installed"
echo ""

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "✅ PostgreSQL installed and started"
echo ""

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Nginx installed and started"
echo ""

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

echo "✅ PM2 installed"
echo ""

# Install Certbot for SSL
echo "📦 Installing Certbot for SSL certificates..."
sudo apt-get install -y certbot python3-certbot-nginx

echo "✅ Certbot installed"
echo ""

# Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p /var/www/CelebrationGarden
sudo mkdir -p /var/backups/celebration-garden

# Set permissions
sudo chown -R $USER:$USER /var/www/CelebrationGarden
sudo chown -R $USER:$USER /var/backups/celebration-garden

echo "✅ Directories created"
echo ""

# Create PostgreSQL database and user
echo "🗄️  Setting up PostgreSQL database..."
echo "Please run the following commands manually to set up the database:"
echo ""
echo "sudo -u postgres psql"
echo "CREATE DATABASE celebration_garden;"
echo "CREATE USER strapi_user WITH PASSWORD 'your_secure_password_here';"
echo "GRANT ALL PRIVILEGES ON DATABASE celebration_garden TO strapi_user;"
echo "ALTER USER strapi_user CREATEDB;"
echo "\\q"
echo ""

echo "✅ Setup script completed!"
echo ""
echo "📝 Next steps:"
echo "1. Set up PostgreSQL database (see commands above)"
echo "2. Clone your repository directly to /var/www/CelebrationGarden:"
echo "   cd /var/www"
echo "   git clone YOUR_REPO_URL CelebrationGarden"
echo "3. Configure environment variables"
echo "4. Run deployment scripts from /var/www/CelebrationGarden"
echo ""
echo "For detailed instructions, see: deployment/DEPLOYMENT_GUIDE.md"

