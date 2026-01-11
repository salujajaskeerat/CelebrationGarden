# Nginx Configuration Setup for Celebration Garden

## Domain Configuration

- **Main Domain**: `celebration-garden.com` → Next.js Frontend (port 3000)
- **Admin Subdomain**: `admin.celebration-garden.com` → Strapi Admin Panel (port 1337)

## DNS Setup

Before deploying nginx configs, ensure your DNS records are set up:

1. **A Record for main domain:**
   ```
   celebration-garden.com → Your Server IP
   www.celebration-garden.com → Your Server IP
   ```

2. **A Record for admin subdomain:**
   ```
   admin.celebration-garden.com → Your Server IP
   ```

## Deployment Steps

### 1. Copy Configuration Files to Server

```bash
# Copy Strapi config
sudo cp deployment/config/nginx-strapi.conf /etc/nginx/sites-available/strapi

# Copy Next.js config
sudo cp deployment/config/nginx-nextjs.conf /etc/nginx/sites-available/celebration-garden
```

### 2. Enable Sites

```bash
# Create symlinks to enable sites
sudo ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/celebration-garden /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
sudo rm /etc/nginx/sites-enabled/default
```

### 3. Test Configuration

```bash
# Test nginx configuration
sudo nginx -t
```

### 4. Reload Nginx

```bash
# Reload nginx to apply changes
sudo systemctl reload nginx
```

## SSL Setup (After DNS is Working)

Once DNS is configured and sites are accessible via HTTP:

### 1. Install Certbot

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

### 2. Get SSL Certificates

```bash
# For main domain
sudo certbot --nginx -d celebration-garden.com -d www.celebration-garden.com

# For admin subdomain
sudo certbot --nginx -d admin.celebration-garden.com
```

### 3. Uncomment SSL Configuration

After getting certificates, uncomment the SSL server blocks in:
- `/etc/nginx/sites-available/strapi`
- `/etc/nginx/sites-available/celebration-garden`

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

After setup, verify:

1. **Main domain**: `http://celebration-garden.com` → Should show Next.js frontend
2. **Admin subdomain**: `http://admin.celebration-garden.com` → Should show Strapi admin login

## Troubleshooting

### Check nginx status
```bash
sudo systemctl status nginx
```

### Check nginx error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check if ports are in use
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Verify DNS resolution
```bash
nslookup celebration-garden.com
nslookup admin.celebration-garden.com
```

## Important Notes

- Make sure Strapi is running on `localhost:1337`
- Make sure Next.js is running on `localhost:3000`
- Both services should be running before accessing via domains
- Firewall should allow ports 80 and 443 (and 22 for SSH)
