# Deployment Directory

This directory contains all scripts, configuration files, and documentation needed to deploy Celebration Garden on AWS EC2.

## Directory Structure

```
deployment/
├── scripts/              # All executable deployment scripts
│   ├── ec2-setup.sh
│   ├── initial-clone.sh
│   ├── deploy-update.sh
│   ├── setup-pm2-strapi.sh
│   ├── setup-postgres.sh
│   ├── backup-database.sh
│   ├── restore-database.sh
│   ├── deploy-strapi.sh
│   └── setup-ssh-config.sh
├── config/               # Configuration files
│   ├── pm2-ecosystem.config.js
│   ├── nginx-strapi.conf
│   ├── nginx-nextjs.conf
│   ├── env-strapi-template.txt
│   ├── env-nextjs-template.txt
│   └── ssh-config-example.txt
├── docs/                 # Documentation
│   ├── DEPLOYMENT_WORKFLOW.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── QUICK_START.md
│   ├── TROUBLESHOOTING.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── migrate-sqlite-to-postgres.md
└── README.md             # This file
```

## Quick Start

**⭐ Recommended for Low-RAM EC2 (Local Builds):**
1. Read `docs/LOCAL_BUILD_WORKFLOW.md` - Build locally, deploy to EC2
2. Use `scripts/deploy-all.sh` to deploy both applications
3. No building happens on EC2 - perfect for t2.micro instances

**Alternative (Build on EC2):**
1. Read `docs/DEPLOYMENT_WORKFLOW.md` for the streamlined workflow
2. Clone directly to `/var/www/CelebrationGarden` using `scripts/initial-clone.sh`
3. For updates, use `scripts/deploy-update.sh` after pushing commits
4. **Note**: Requires sufficient RAM on EC2 for building

## Scripts Overview

### Initial Setup
- **`scripts/ec2-setup.sh`** - Initial server setup (Node.js, PostgreSQL, Nginx, PM2)
- **`scripts/initial-clone.sh`** - Clone repository directly to /var/www/CelebrationGarden

### Deployment
- **`scripts/deploy-all.sh`** - **Recommended** Deploy both Strapi and Next.js (builds locally)
- **`scripts/deploy-strapi.sh`** - Deploy Strapi only (builds locally, perfect for low-RAM EC2)
- **`scripts/deploy-nextjs.sh`** - Deploy Next.js only (builds locally, perfect for low-RAM EC2)
- **`scripts/deploy-update.sh`** - Quick update script (git pull + restart services) - **Requires building on EC2**
- **`scripts/setup-pm2-strapi.sh`** - Set up PM2 for Strapi and Next.js

### Database
- **`scripts/setup-postgres.sh`** - PostgreSQL database and user creation
- **`scripts/backup-database.sh`** - Automated database backup script
- **`scripts/restore-database.sh`** - Database restore from backup

### Utilities
- **`scripts/setup-ssh-config.sh`** - SSH configuration helper

## Configuration Files

- **`config/pm2-ecosystem.config.js`** - PM2 process manager configuration
- **`config/nginx-strapi.conf`** - Nginx configuration for Strapi API
- **`config/nginx-nextjs.conf`** - Nginx configuration for Next.js app
- **`config/env-strapi-template.txt`** - Strapi environment variables template
- **`config/env-nextjs-template.txt`** - Next.js environment variables template
- **`config/ssh-config-example.txt`** - Example SSH config

## Documentation

- **`docs/LOCAL_BUILD_WORKFLOW.md`** - **⭐ Recommended for low-RAM EC2** Build locally, deploy to EC2
- **`docs/DEPLOYMENT_WORKFLOW.md`** - Streamlined workflow (clone to /var/www, build on EC2)
- **`docs/DEPLOYMENT_GUIDE.md`** - Complete step-by-step deployment guide
- **`docs/QUICK_START.md`** - Condensed quick start guide
- **`docs/TROUBLESHOOTING.md`** - Common issues and solutions
- **`docs/IMPLEMENTATION_SUMMARY.md`** - Implementation details
- **`docs/migrate-sqlite-to-postgres.md`** - Database migration guide

## Architecture

```
EC2 Instance (t2.micro)
├── PostgreSQL (port 5432)
├── Strapi (port 1337) - Managed by PM2
├── Next.js (port 3000) - Managed by PM2
└── Nginx (port 80/443) - Reverse proxy
```

## Cost

- **Free Tier (12 months)**: $0/month
- **After Free Tier**: ~$11-14/month
- **Traffic**: Supports up to 1000+ users/month

## Support

For issues or questions:
1. Check `docs/TROUBLESHOOTING.md` for common issues
2. Review PM2 logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## Usage Examples

### Initial Setup
```bash
# On EC2
cd /var/www
git clone YOUR_REPO_URL CelebrationGarden
cd CelebrationGarden
chmod +x deployment/scripts/*.sh
./deployment/scripts/ec2-setup.sh
```

### Update After Commits

**Option 1: Local Build (Recommended for Low-RAM EC2)**
```bash
# On Local Machine
cd /path/to/CelebrationGarden
./deployment/scripts/deploy-all.sh

# On EC2: Restart services
pm2 restart all
```

**Option 2: Build on EC2 (Requires Sufficient RAM)**
```bash
# On EC2
cd /var/www/CelebrationGarden
./deployment/scripts/deploy-update.sh
```

### Configure Nginx
```bash
# On EC2
cd /var/www/CelebrationGarden
sudo cp deployment/config/nginx-strapi.conf /etc/nginx/sites-available/strapi
sudo cp deployment/config/nginx-nextjs.conf /etc/nginx/sites-available/celebration-garden
```