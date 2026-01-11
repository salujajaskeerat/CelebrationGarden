# Nginx Troubleshooting for Strapi Admin

## Issue: "Redirecting to /admin" when accessing admin.celebration-garden.com

### Problem
When accessing `admin.celebration-garden.com`, you see "Redirecting to /admin" but it doesn't load properly.

### Solution

The nginx configuration has been updated to properly handle Strapi's redirects. After updating the config on your server:

1. **Copy the updated config to your server:**
   ```bash
   sudo cp /var/www/CelebrationGarden/deployment/config/nginx-strapi.conf /etc/nginx/sites-available/strapi
   ```

2. **Test the configuration:**
   ```bash
   sudo nginx -t
   ```

3. **Reload nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

4. **Test the redirect:**
   ```bash
   curl -L admin.celebration-garden.com
   ```
   The `-L` flag follows redirects, so you should see the full HTML response.

### What Changed

The configuration now includes:
- `X-Forwarded-Host` header to preserve the original hostname
- `X-Forwarded-Port` header for proper port handling
- `proxy_redirect` rules to rewrite Strapi's internal redirects to use the correct domain

### Verify It's Working

1. **Check nginx is running:**
   ```bash
   sudo systemctl status nginx
   ```

2. **Check Strapi is running:**
   ```bash
   pm2 status
   # or
   curl http://localhost:1337/admin
   ```

3. **Test from browser:**
   - Visit `http://admin.celebration-garden.com`
   - Should redirect to `http://admin.celebration-garden.com/admin` and show login page

4. **Check nginx error logs if issues persist:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Common Issues

**502 Bad Gateway:**
- Strapi is not running on port 1337
- Check: `pm2 status` or `curl http://localhost:1337`

**Redirect loop:**
- Check that `proxy_redirect` rules are correct
- Verify DNS is pointing to the correct server

**Still seeing "Redirecting to /admin":**
- Clear browser cache
- Try in incognito/private mode
- Check browser console for errors
