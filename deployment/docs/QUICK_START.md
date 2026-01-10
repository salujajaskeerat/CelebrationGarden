# Quick Start Deployment Guide

This is a condensed version of the full deployment guide. For detailed instructions, see `DEPLOYMENT_GUIDE.md`.

## Prerequisites Checklist

- [ ] AWS EC2 instance (t2.micro/t3.micro) running Ubuntu 22.04
- [ ] SSH access to EC2 instance
- [ ] Domain name (optional, for SSL)
- [ ] AWS Security Groups configured (ports 22, 80, 443)

## 5-Minute Setup

### 1. Initial Server Setup (2 minutes)

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run initial setup script (installs Node.js, PostgreSQL, Nginx, PM2)
cd /var/www
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
# Download and run ec2-setup.sh from your repo, or run:
# (The script will be available after cloning in step 2)
```

### 2. Clone Repository (1 minute)

```bash
# Clone directly to /var/www/CelebrationGarden
cd /var/www
git clone YOUR_REPO_URL CelebrationGarden
cd CelebrationGarden

# Make scripts executable
chmod +x deployment/*.sh

# Run initial setup (if not done in step 1)
./deployment/ec2-setup.sh
```

### 3. Database Setup (1 minute)

```bash
cd /var/www/CelebrationGarden/deployment
./setup-postgres.sh
# Enter and confirm database password
```

### 4. Deploy Applications (2 minutes)

```bash
# Configure Strapi
cd /var/www/CelebrationGarden/backend/celebration-garden-cms
cp ../../deployment/env-strapi-template.txt .env
nano .env  # Update DATABASE_PASSWORD and generate security keys
npm install
npm run build

# Configure Next.js
cd /var/www/CelebrationGarden/frontend
cp ../deployment/env-nextjs-template.txt .env.production
nano .env.production  # Update Strapi URL
npm install
npm run build
```

### 5. Start with PM2 (30 seconds)

```bash
cd /var/www/CelebrationGarden
./deployment/setup-pm2-strapi.sh
# Follow the PM2 startup command it outputs
```

### 6. Configure Nginx (1 minute)

```bash
# Strapi
cd /var/www/CelebrationGarden
sudo cp deployment/nginx-strapi.conf /etc/nginx/sites-available/strapi
sudo nano /etc/nginx/sites-available/strapi  # Update domain
sudo ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/

# Next.js
sudo cp deployment/nginx-nextjs.conf /etc/nginx/sites-available/celebration-garden
sudo nano /etc/nginx/sites-available/celebration-garden  # Update domain
sudo ln -s /etc/nginx/sites-available/celebration-garden /etc/nginx/sites-enabled/

# Remove default site and reload
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Setup (Optional, 2 minutes)

```bash
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Verify Deployment

```bash
# Check services
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Test URLs
curl http://localhost:1337/admin
curl http://localhost:3000
```

## Common Commands

```bash
# View logs
pm2 logs

# Restart apps
pm2 restart all

# Backup database
/var/www/CelebrationGarden/deployment/backup-database.sh

# Update application (after pushing new commits)
cd /var/www/CelebrationGarden
./deployment/deploy-update.sh
```

## Troubleshooting

**Apps won't start:**
- Check `.env` files are configured correctly
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check logs: `pm2 logs`

**502 Bad Gateway:**
- Verify apps are running: `pm2 status`
- Check Nginx config: `sudo nginx -t`
- Check error logs: `sudo tail -f /var/log/nginx/error.log`

**Database connection errors:**
- Verify password in `.env` matches setup
- Test connection: `psql -U strapi_user -d celebration_garden`

## Next Steps

1. Point your domain DNS to EC2 IP
2. Complete SSL setup
3. Configure automated backups (cron job)
4. Set up monitoring

For detailed instructions, see `DEPLOYMENT_GUIDE.md`.

