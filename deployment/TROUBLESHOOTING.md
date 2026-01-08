# Deployment Troubleshooting Guide

## Common Issues and Solutions

### Issue: "git clone your-strapi-repo-url" Error

**Problem**: The deployment guide uses a placeholder URL. You need to either:
1. Set up a git repository, OR
2. Copy files directly to the server

**Solution 1: Copy Files Using SCP (Recommended for First Deployment)**

From your local machine:
```bash
# Copy Strapi project to EC2
scp -i your-key.pem -r celebration-garden-cms ubuntu@your-ec2-ip:/var/www/

# Copy Next.js project to EC2
scp -i your-key.pem -r . ubuntu@your-ec2-ip:/var/www/celebration-garden
```

**Solution 2: Use rsync (Better for Updates)**

From your local machine:
```bash
# Sync Strapi project
rsync -avz -e "ssh -i your-key.pem" --exclude 'node_modules' --exclude '.tmp' celebration-garden-cms/ ubuntu@your-ec2-ip:/var/www/celebration-garden-cms/

# Sync Next.js project
rsync -avz -e "ssh -i your-key.pem" --exclude 'node_modules' --exclude '.next' . ubuntu@your-ec2-ip:/var/www/celebration-garden/
```

**Solution 3: Create Git Repository**

1. Create a GitHub/GitLab repository
2. Push your code
3. Then use the git clone command with your actual URL

### Issue: Permission Denied Errors

**Problem**: Can't write to `/var/www/` directory

**Solution**:
```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/celebration-garden-cms
sudo chown -R $USER:$USER /var/www/celebration-garden
```

### Issue: npm install Fails

**Problem**: npm install errors or timeouts

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try with verbose output
npm install --verbose

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Issue: "pg" Package Installation Fails

**Problem**: Can't install PostgreSQL driver

**Solution**:
```bash
# Make sure you're in the right directory
cd /var/www/celebration-garden-cms

# Install pg specifically
npm install pg@^8.11.3

# Verify installation
npm list pg
```

### Issue: Database Connection Errors

**Problem**: Strapi can't connect to PostgreSQL

**Solution**:
```bash
# Test PostgreSQL connection
psql -U strapi_user -d celebration_garden -h localhost

# If connection fails, check:
# 1. PostgreSQL is running
sudo systemctl status postgresql

# 2. Check pg_hba.conf (if needed)
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Should have: local   all   all   peer

# 3. Verify credentials in .env file
cat /var/www/celebration-garden-cms/.env | grep DATABASE
```

### Issue: "Cannot find module" Errors

**Problem**: Missing dependencies or wrong Node.js version

**Solution**:
```bash
# Check Node.js version (should be 20.x)
node --version

# If wrong version, reinstall Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port Already in Use

**Problem**: Port 1337 or 3000 already in use

**Solution**:
```bash
# Check what's using the port
sudo lsof -i :1337
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>

# Or change the port in .env file
```

### Issue: Nginx 502 Bad Gateway

**Problem**: Nginx can't connect to backend services

**Solution**:
```bash
# Check if services are running
pm2 status

# Check service logs
pm2 logs strapi
pm2 logs nextjs

# Test services directly
curl http://localhost:1337/admin
curl http://localhost:3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Environment Variables Not Loading

**Problem**: .env file not being read

**Solution**:
```bash
# Verify .env file exists and has correct format
cat /var/www/celebration-garden-cms/.env

# Check file permissions
ls -la /var/www/celebration-garden-cms/.env

# Make sure no spaces around = sign
# Correct: DATABASE_PASSWORD=password
# Wrong: DATABASE_PASSWORD = password
```

### Issue: Build Fails

**Problem**: npm run build errors

**Solution**:
```bash
# Check for TypeScript errors
npm run build 2>&1 | tee build.log

# Common fixes:
# 1. Update dependencies
npm update

# 2. Clear Next.js cache
rm -rf .next

# 3. Check Node.js version matches requirements
node --version
```

## Step-by-Step Recovery

If you're stuck, try this clean setup:

```bash
# 1. Stop everything
pm2 stop all
pm2 delete all

# 2. Clean directories
cd /var/www
rm -rf celebration-garden-cms/node_modules
rm -rf celebration-garden/node_modules

# 3. Reinstall dependencies
cd celebration-garden-cms
npm install
npm install pg

cd ../celebration-garden
npm install

# 4. Rebuild
cd ../celebration-garden-cms
npm run build

cd ../celebration-garden
npm run build

# 5. Restart with PM2
cd /var/www
pm2 start pm2-ecosystem.config.js
pm2 save
```

## Getting Help

If you're still stuck:

1. **Check logs**:
   ```bash
   pm2 logs
   sudo journalctl -u nginx
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Verify all services**:
   ```bash
   sudo systemctl status postgresql
   sudo systemctl status nginx
   pm2 status
   ```

3. **Test connections**:
   ```bash
   # Database
   psql -U strapi_user -d celebration_garden
   
   # Strapi
   curl http://localhost:1337/admin
   
   # Next.js
   curl http://localhost:3000
   ```

4. **Share error messages**: Copy the exact error message for better help

