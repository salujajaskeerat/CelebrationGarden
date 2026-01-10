# Code Restructure Summary

## Changes Made

The codebase has been restructured into a clear `backend/` and `frontend/` folder structure:

### New Structure

```
CelebrationGarden/
├── backend/
│   └── celebration-garden-cms/    # Strapi CMS backend
├── frontend/                       # Next.js frontend application
│   ├── app/                        # Next.js app directory
│   ├── components/                 # React components
│   ├── lib/                        # Utility libraries
│   └── [config files]              # Next.js config files
├── deployment/                     # Deployment scripts
└── strapi-setup/                   # Strapi setup documentation
```

### Files Moved

**Backend:**
- `celebration-garden-cms/` → `backend/celebration-garden-cms/`

**Frontend:**
- `app/` → `frontend/app/`
- `components/` → `frontend/components/`
- `lib/` → `frontend/lib/`
- `package.json` → `frontend/package.json`
- `next.config.js` → `frontend/next.config.js`
- `tsconfig.json` → `frontend/tsconfig.json`
- `tailwind.config.js` → `frontend/tailwind.config.js`
- `postcss.config.js` → `frontend/postcss.config.js`
- `metadata.json` → `frontend/metadata.json`
- `next-env.d.ts` → `frontend/next-env.d.ts`
- `node_modules/` → `frontend/node_modules/`

### Updated Files

**Deployment Scripts:**
- `deployment/pm2-ecosystem.config.js` - Updated paths to `/var/www/CelebrationGarden/backend/celebration-garden-cms` and `/var/www/CelebrationGarden/frontend`
- `deployment/deploy-strapi.sh` - Updated `CMS_DIR` to `backend/celebration-garden-cms` and `EC2_PATH` to `/var/www/CelebrationGarden/backend/celebration-garden-cms`
- `deployment/setup-pm2-strapi.sh` - Updated `STRAPI_DIR` to `/var/www/CelebrationGarden/backend/celebration-garden-cms`
- `deployment/ec2-setup.sh` - Updated directory creation to `/var/www/CelebrationGarden/backend` and `/var/www/CelebrationGarden/frontend`

### Server Paths (EC2)

**Old paths:**
- `/var/www/celebration-garden-cms`
- `/var/www/celebration-garden`

**New paths:**
- `/var/www/CelebrationGarden/backend/celebration-garden-cms`
- `/var/www/CelebrationGarden/frontend`

### Next Steps

1. **Update EC2 server structure:**
   - Create the new directory structure on your EC2 server
   - Move existing files to match the new structure
   - Update PM2 configuration

2. **Update environment variables:**
   - Ensure any hardcoded paths in environment files are updated
   - Update any CI/CD pipelines if applicable

3. **Test deployment:**
   - Run `./deployment/deploy-strapi.sh` to deploy backend
   - Deploy frontend separately (create deployment script if needed)

4. **Update PM2 on server:**
   - Run `./deployment/setup-pm2-strapi.sh` to update PM2 configuration
   - Or manually update PM2 config and restart processes

### Notes

- All deployment scripts have been updated to use the new paths
- The structure is now more maintainable and follows common project organization patterns
- Backend and frontend are clearly separated, making it easier to deploy independently
