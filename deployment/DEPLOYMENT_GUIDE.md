# Complete EC2 Deployment Guide

This guide walks you through deploying Celebration Garden (Strapi + Next.js) on AWS EC2 with PostgreSQL.

## Prerequisites

- AWS EC2 instance (t2.micro or t3.micro)
- Ubuntu 22.04 LTS (recommended)
- SSH access to your EC2 instance
- Domain name (optional, for SSL)

## Step 1: Initial Server Setup

### 1.1 Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.2 Run Setup Script

```bash
# Clone your repository or upload files
git clone your-repo-url
cd CelebrationGarden

# Make scripts executable
chmod +x deployment/*.sh

# Run initial setup
./deployment/ec2-setup.sh
```

This installs:
- Node.js 20.x
- PostgreSQL
- Nginx
- PM2
- Certbot (for SSL)

## Step 2: PostgreSQL Database Setup

### 2.1 Create Database and User

```bash
cd deployment
chmod +x setup-postgres.sh
./setup-postgres.sh
```

Follow the prompts to set a secure password. **Save this password!**

### 2.2 Verify Database

```bash
sudo -u postgres psql -c "\l" | grep celebration_garden
```

## Step 3: Deploy Strapi

### 3.1 Clone and Setup

```bash
# Navigate to web directory
cd /var/www

# Clone your Strapi repository
git clone your-strapi-repo-url celebration-garden-cms
cd celebration-garden-cms

# Install dependencies
npm install

# Install PostgreSQL driver
npm install pg
```

### 3.2 Configure Environment

```bash
# Copy example env file
cp ../CelebrationGarden/deployment/.env.strapi.example .env

# Edit environment variables
nano .env
```

**Required changes:**
- Set `DATABASE_CLIENT=postgres`
- Update `DATABASE_PASSWORD` with the password from Step 2.1
- Generate new security keys (see below)

### 3.3 Generate Security Keys

```bash
# Generate random keys for production
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run this 5 times and update:
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`

### 3.4 Build Strapi

```bash
npm run build
```

### 3.5 Test Strapi

```bash
npm start
```

Visit `http://your-ec2-ip:1337/admin` to verify it works. Press Ctrl+C to stop.

## Step 4: Deploy Next.js

### 4.1 Clone and Setup

```bash
cd /var/www

# Clone your Next.js repository
git clone your-nextjs-repo-url celebration-garden
cd celebration-garden

# Install dependencies
npm install
```

### 4.2 Configure Environment

```bash
# Copy example env file
cp ../CelebrationGarden/deployment/.env.nextjs.example .env.production

# Edit environment variables
nano .env.production
```

**Update:**
- `NEXT_PUBLIC_STRAPI_URL` (use your domain or EC2 IP)
- `STRAPI_API_TOKEN` (if using API tokens)
- `NEXT_PUBLIC_WHATSAPP_PHONE`

### 4.3 Build Next.js

```bash
npm run build
```

### 4.4 Test Next.js

```bash
npm start
```

Visit `http://your-ec2-ip:3000` to verify. Press Ctrl+C to stop.

## Step 5: Configure PM2

### 5.1 Setup PM2

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Copy PM2 config
cp /var/www/CelebrationGarden/deployment/pm2-ecosystem.config.js /var/www/

# Start applications
cd /var/www
pm2 start pm2-ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### 5.2 Verify PM2

```bash
pm2 status
pm2 logs
```

Both `strapi` and `nextjs` should be running.

## Step 6: Configure Nginx

### 6.1 Setup Strapi Nginx Config

```bash
# Copy Nginx config
sudo cp /var/www/CelebrationGarden/deployment/nginx-strapi.conf /etc/nginx/sites-available/strapi

# Edit domain name
sudo nano /etc/nginx/sites-available/strapi
# Change `api.yourdomain.com` to your domain or remove server_name line

# Enable site
sudo ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6.2 Setup Next.js Nginx Config

```bash
# Copy Nginx config
sudo cp /var/www/CelebrationGarden/deployment/nginx-nextjs.conf /etc/nginx/sites-available/celebration-garden

# Edit domain name
sudo nano /etc/nginx/sites-available/celebration-garden
# Change `yourdomain.com` to your domain

# Enable site
sudo ln -s /etc/nginx/sites-available/celebration-garden /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Setup SSL (Let's Encrypt)

### 7.1 Get SSL Certificate

```bash
# For Strapi API
sudo certbot --nginx -d api.yourdomain.com

# For Next.js site
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7.2 Update Nginx Configs

After SSL is set up, uncomment the SSL sections in:
- `/etc/nginx/sites-available/strapi`
- `/etc/nginx/sites-available/celebration-garden`

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: Configure AWS Security Groups

### 8.1 Required Ports

In AWS Console → EC2 → Security Groups:

**Inbound Rules:**
- Port 22 (SSH) - Your IP only
- Port 80 (HTTP) - 0.0.0.0/0
- Port 443 (HTTPS) - 0.0.0.0/0

**Outbound Rules:**
- All traffic - 0.0.0.0/0

### 8.2 Remove Default Nginx Page

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Step 9: Setup Automated Backups

### 9.1 Configure Backup Script

```bash
# Edit backup script
nano /var/www/CelebrationGarden/deployment/backup-database.sh

# Add database password to environment (for cron)
export DATABASE_PASSWORD="your_password_here"
```

### 9.2 Setup Cron Job

```bash
crontab -e
```

Add this line (runs daily at 2 AM):
```
0 2 * * * /var/www/CelebrationGarden/deployment/backup-database.sh >> /var/log/backup.log 2>&1
```

## Step 10: Final Verification

### 10.1 Check Services

```bash
# Check PM2
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check logs
pm2 logs
```

### 10.2 Test URLs

- Strapi Admin: `https://api.yourdomain.com/admin`
- Next.js Site: `https://yourdomain.com`
- API Endpoint: `https://api.yourdomain.com/api/invitations`

## Step 11: Update DNS

Point your domain to your EC2 instance:

- A Record: `yourdomain.com` → EC2 Public IP
- A Record: `api.yourdomain.com` → EC2 Public IP
- A Record: `www.yourdomain.com` → EC2 Public IP

## Maintenance Commands

### View Logs
```bash
pm2 logs
pm2 logs strapi
pm2 logs nextjs
```

### Restart Applications
```bash
pm2 restart all
pm2 restart strapi
pm2 restart nextjs
```

### Update Application
```bash
cd /var/www/celebration-garden
git pull
npm install
npm run build
pm2 restart nextjs

cd /var/www/celebration-garden-cms
git pull
npm install
npm run build
pm2 restart strapi
```

### Backup Database
```bash
/var/www/CelebrationGarden/deployment/backup-database.sh
```

### Restore Database
```bash
/var/www/CelebrationGarden/deployment/restore-database.sh /path/to/backup.sql.gz
```

## Troubleshooting

### Strapi won't start
- Check `.env` file configuration
- Verify PostgreSQL is running and accessible
- Check logs: `pm2 logs strapi`

### Next.js won't start
- Check `.env.production` file
- Verify Strapi URL is correct
- Check logs: `pm2 logs nextjs`

### Nginx 502 errors
- Verify applications are running: `pm2 status`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify ports 1337 and 3000 are not blocked

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env`
- Test connection: `psql -U strapi_user -d celebration_garden`

## Security Checklist

- [ ] Changed default SSH port (optional)
- [ ] Set up SSH key authentication only
- [ ] Configured firewall (Security Groups)
- [ ] Generated secure Strapi keys
- [ ] Set strong database password
- [ ] SSL certificates installed
- [ ] Regular backups configured
- [ ] Updated all default passwords

## Cost Monitoring

Monitor your AWS costs:
- AWS Console → Billing & Cost Management
- Set up billing alerts
- Free tier lasts 12 months
- Expected cost after: ~$11-14/month

---

**Deployment Complete!** 🎉

Your Celebration Garden application should now be live and accessible.

