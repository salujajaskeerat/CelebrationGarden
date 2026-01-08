# PM2 Setup Guide for Strapi

This guide helps you set up PM2 to manage your Strapi application on the EC2 server.

## Quick Setup (Recommended)

Run the automated setup script on your EC2 server:

```bash
# SSH into your server
ssh ubuntu@your-server-ip

# Navigate to the deployment directory
cd /var/www/CelebrationGarden/deployment

# Run the setup script
./setup-pm2-strapi.sh
```

The script will:
- ✅ Check/install PM2
- ✅ Create log directories
- ✅ Copy PM2 config
- ✅ Start Strapi with PM2
- ✅ Save PM2 configuration
- ✅ Set up PM2 to start on boot

## Manual Setup

If you prefer to set up PM2 manually, follow these steps:

### 1. Install PM2 (if not already installed)

```bash
sudo npm install -g pm2
```

### 2. Create Log Directory

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 3. Copy PM2 Config

```bash
# Copy the PM2 config to a convenient location
cp /var/www/CelebrationGarden/deployment/pm2-ecosystem.config.js /var/www/pm2-ecosystem.config.js
```

### 4. Start Strapi with PM2

```bash
cd /var/www
pm2 start pm2-ecosystem.config.js --only strapi
```

Or if you want to start both Strapi and Next.js:

```bash
pm2 start pm2-ecosystem.config.js
```

### 5. Save PM2 Configuration

```bash
pm2 save
```

This ensures PM2 remembers your processes after server restarts.

### 6. Set Up PM2 to Start on Boot

```bash
pm2 startup
```

This will output a command. **Copy and run that command** (it will require sudo).

Example output:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## Common PM2 Commands

### View Status
```bash
pm2 status
```

### View Logs
```bash
# All logs
pm2 logs

# Strapi logs only
pm2 logs strapi

# Follow logs in real-time
pm2 logs strapi --lines 50

# Clear logs
pm2 flush
```

### Manage Processes
```bash
# Restart Strapi
pm2 restart strapi

# Stop Strapi
pm2 stop strapi

# Start Strapi
pm2 start strapi

# Delete Strapi from PM2
pm2 delete strapi

# Restart all processes
pm2 restart all
```

### Monitoring
```bash
# Real-time monitoring dashboard
pm2 monit

# Show detailed info
pm2 show strapi
```

## Troubleshooting

### PM2 process not found
If you get `[PM2][ERROR] Process or Namespace strapi not found`, it means Strapi hasn't been started with PM2 yet. Run:

```bash
cd /var/www
pm2 start pm2-ecosystem.config.js --only strapi
pm2 save
```

### Check if Strapi is running
```bash
pm2 status
```

You should see `strapi` in the list with status `online`.

### View error logs
```bash
pm2 logs strapi --err
```

Or check the log files directly:
```bash
tail -f /var/log/pm2/strapi-error.log
tail -f /var/log/pm2/strapi-out.log
```

### Restart after code changes
After deploying new code:

```bash
pm2 restart strapi
```

Or if you want to reload without downtime:

```bash
pm2 reload strapi
```

## PM2 Configuration

The PM2 configuration is located at:
- `/var/www/CelebrationGarden/deployment/pm2-ecosystem.config.js`
- Copied to: `/var/www/pm2-ecosystem.config.js`

Key settings for Strapi:
- **Name**: `strapi`
- **Working Directory**: `/var/www/celebration-garden-cms`
- **Script**: `npm start`
- **Port**: `1337`
- **Auto-restart**: Enabled
- **Max Memory**: 500MB (restarts if exceeded)
- **Logs**: `/var/log/pm2/strapi-*.log`

## Next Steps

After setting up PM2:

1. ✅ Verify Strapi is running: `pm2 status`
2. ✅ Check logs: `pm2 logs strapi`
3. ✅ Test the API: `curl http://localhost:1337/api/invitations`
4. ✅ Set up PM2 to start on boot: `pm2 startup` (then run the output command)

Your Strapi application is now managed by PM2 and will automatically restart if it crashes! 🚀
