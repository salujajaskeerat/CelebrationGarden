# Deployment Directory

This directory contains all scripts and configuration files needed to deploy Celebration Garden on AWS EC2.

## Files Overview

### Setup Scripts
- `ec2-setup.sh` - Initial server setup (Node.js, PostgreSQL, Nginx, PM2)
- `setup-postgres.sh` - PostgreSQL database and user creation
- `backup-database.sh` - Automated database backup script
- `restore-database.sh` - Database restore from backup

### Configuration Files
- `nginx-strapi.conf` - Nginx configuration for Strapi API
- `nginx-nextjs.conf` - Nginx configuration for Next.js app
- `pm2-ecosystem.config.js` - PM2 process manager configuration
- `env-strapi-template.txt` - Strapi environment variables template
- `env-nextjs-template.txt` - Next.js environment variables template

### Documentation
- `DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment guide
- `QUICK_START.md` - Condensed quick start guide
- `migrate-sqlite-to-postgres.md` - Database migration guide
- `README.md` - This file

## Quick Start

1. Read `QUICK_START.md` for a fast deployment
2. Or follow `DEPLOYMENT_GUIDE.md` for detailed instructions

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
1. Check `DEPLOYMENT_GUIDE.md` troubleshooting section
2. Review PM2 logs: `pm2 logs`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

