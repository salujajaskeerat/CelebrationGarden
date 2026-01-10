# Deployment Workflow

This document explains the streamlined deployment workflow where the repository is cloned directly to `/var/www/CelebrationGarden`.

## Overview

**Old Workflow:**
1. Clone to `~/` (home directory)
2. Copy files to `/var/www/`
3. Set up from there

**New Workflow:**
1. Clone directly to `/var/www/CelebrationGarden`
2. Set up everything from there
3. For updates: just `git pull` and restart services

## Initial Setup

### Step 1: Server Setup

SSH into your EC2 instance and run:

```bash
# Create directory and set permissions
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Clone repository directly to /var/www/CelebrationGarden
cd /var/www
git clone YOUR_REPO_URL CelebrationGarden
cd CelebrationGarden

# Make scripts executable
chmod +x deployment/*.sh

# Run initial server setup
./deployment/ec2-setup.sh
```

This installs:
- Node.js 20.x
- PostgreSQL
- Nginx
- PM2
- Certbot (for SSL)

### Step 2: Database Setup

```bash
cd /var/www/CelebrationGarden/deployment
./setup-postgres.sh
# Enter and confirm database password
```

### Step 3: Configure Environment Variables

**Strapi Backend:**
```bash
cd /var/www/CelebrationGarden/backend/celebration-garden-cms
cp ../../deployment/env-strapi-template.txt .env
nano .env
# Update:
# - DATABASE_PASSWORD
# - Generate security keys (APP_KEYS, API_TOKEN_SALT, etc.)
# - Cloudinary credentials (if using)
```

**Next.js Frontend:**
```bash
cd /var/www/CelebrationGarden/frontend
cp ../deployment/env-nextjs-template.txt .env.production
nano .env.production
# Update:
# - STRAPI_API_URL
# - Any other frontend environment variables
```

### Step 4: Install Dependencies and Build

**Strapi:**
```bash
cd /var/www/CelebrationGarden/backend/celebration-garden-cms
npm install
npm run build
```

**Next.js:**
```bash
cd /var/www/CelebrationGarden/frontend
npm install
npm run build
```

### Step 5: Start Services with PM2

```bash
cd /var/www/CelebrationGarden
./deployment/setup-pm2-strapi.sh
# Follow the PM2 startup command it outputs
```

### Step 6: Configure Nginx

```bash
cd /var/www/CelebrationGarden

# Strapi API
sudo cp deployment/nginx-strapi.conf /etc/nginx/sites-available/strapi
sudo nano /etc/nginx/sites-available/strapi  # Update domain
sudo ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/

# Next.js Frontend
sudo cp deployment/nginx-nextjs.conf /etc/nginx/sites-available/celebration-garden
sudo nano /etc/nginx/sites-available/celebration-garden  # Update domain
sudo ln -s /etc/nginx/sites-available/celebration-garden /etc/nginx/sites-enabled/

# Remove default site and reload
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Updating After New Commits

After you push new commits to your repository, updating is simple:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project directory
cd /var/www/CelebrationGarden

# Run the update script
./deployment/deploy-update.sh
```

This script will:
1. Pull latest changes from git
2. Install/update dependencies (if package.json changed)
3. Rebuild applications (if package.json changed)
4. Restart PM2 services

### Manual Update (Alternative)

If you prefer to update manually:

```bash
cd /var/www/CelebrationGarden

# Pull latest changes
git pull origin main  # or master

# Update Strapi
cd backend/celebration-garden-cms
npm install --production
npm run build  # Only if package.json changed
pm2 restart strapi

# Update Next.js
cd ../../frontend
npm install --production
npm run build  # Only if package.json changed
pm2 restart nextjs
```

## Directory Structure

After setup, your EC2 instance will have:

```
/var/www/CelebrationGarden/
├── backend/
│   └── celebration-garden-cms/
│       ├── .env
│       ├── dist/
│       ├── node_modules/
│       └── ...
├── frontend/
│   ├── .env.production
│   ├── .next/
│   ├── node_modules/
│   └── ...
├── deployment/
│   ├── deploy-update.sh
│   ├── initial-clone.sh
│   ├── ec2-setup.sh
│   └── ...
└── .git/
```

## Benefits of This Workflow

1. **Simpler Updates**: Just `git pull` and restart - no copying files
2. **Version Control**: Everything is in git, easy to track changes
3. **No Duplication**: Single source of truth at `/var/www/CelebrationGarden`
4. **Easy Rollback**: Use `git checkout` to revert to previous versions
5. **Automated**: The `deploy-update.sh` script handles everything

## Troubleshooting

### Git Pull Fails

If you have local changes that conflict:

```bash
cd /var/www/CelebrationGarden
git stash  # Save local changes
git pull
# Resolve conflicts if any
```

### Services Won't Start

Check logs:
```bash
pm2 logs strapi
pm2 logs nextjs
```

### Need to Rebuild Everything

```bash
cd /var/www/CelebrationGarden

# Strapi
cd backend/celebration-garden-cms
rm -rf dist node_modules
npm install
npm run build
pm2 restart strapi

# Next.js
cd ../../frontend
rm -rf .next node_modules
npm install
npm run build
pm2 restart nextjs
```

## Security Notes

- Never commit `.env` files to git
- Keep your repository private or use environment variables
- Regularly update dependencies: `npm audit fix`
- Use strong database passwords
- Keep your EC2 security groups restricted
