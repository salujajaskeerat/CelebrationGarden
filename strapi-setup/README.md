# Strapi Setup Guide for Celebration Garden

This guide will help you set up a Strapi CMS server for managing invitation content.

## Quick Setup (5 minutes)

### Step 1: Install Strapi

```bash
# Navigate to the strapi-setup directory
cd strapi-setup

# Create a new Strapi project
npx create-strapi-app@latest celebration-garden-cms --quickstart
```

This will:
- Create a Strapi project in `celebration-garden-cms` folder
- Install all dependencies
- Start the Strapi server automatically

### Step 2: Create Admin Account

When Strapi starts, it will open in your browser. Create your admin account:
- Email: (your email)
- Password: (choose a strong password)
- Confirm password: (same password)

### Step 3: Import Content Type Schema

After creating your admin account:

1. Go to **Settings** → **Import/Export** → **Import**
2. Select the file: `invitation-content-type.json`
3. Click **Import**

This will automatically create the "Invitation" content type with all required fields.

### Step 4: Configure API Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Under **Invitation**, check:
   - ✅ **find** (to list invitations)
   - ✅ **findOne** (to get a single invitation)
3. Click **Save**

### Step 5: Start Using Strapi

1. Go to **Content Manager** → **Invitation**
2. Click **Create new entry**
3. Fill in the fields and click **Save** then **Publish**

## Manual Setup (Alternative)

If you prefer to create the content type manually:

### Create Invitation Content Type

1. Go to **Content-Type Builder** → **Create new collection type**
2. Name it: `Invitation` (singular, Strapi will pluralize it)
3. Click **Continue**

### Add Fields

Add these fields in order:

1. **Text** field
   - Name: `slug`
   - Type: Short text
   - Required: ✅ Yes
   - Unique: ✅ Yes

2. **Enumeration** field
   - Name: `type`
   - Values (one per line):
     ```
     Wedding
     Corporate
     Birthday
     Social
     ```
   - Required: ✅ Yes

3. **Text** field
   - Name: `title`
   - Type: Long text
   - Required: ✅ Yes

4. **Text** field
   - Name: `subtitle`
   - Type: Long text
   - Required: ❌ No

5. **Date** field
   - Name: `date`
   - Type: Date
   - Required: ✅ Yes

6. **Text** field
   - Name: `time`
   - Type: Short text
   - Required: ✅ Yes

7. **Rich text** field
   - Name: `description`
   - Type: Rich text
   - Required: ❌ No

8. **Media** field
   - Name: `hero_image`
   - Type: Single media
   - Required: ❌ No

9. Click **Save** to finish

## Environment Variables

Create a `.env` file in your Strapi project root:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here
JWT_SECRET=your-jwt-secret-here
```

(These are auto-generated when you create the project)

## Running Strapi

### Development Mode
```bash
cd celebration-garden-cms
npm run develop
```

### Production Mode
```bash
cd celebration-garden-cms
npm run build
npm run start
```

## Access URLs

- **Admin Panel**: http://localhost:1337/admin
- **API**: http://localhost:1337/api

## For Non-Technical Team Members

### How to Add a New Invitation

1. **Open Strapi Admin Panel**
   - Go to: http://localhost:1337/admin
   - Login with your credentials

2. **Navigate to Invitations**
   - Click **Content Manager** in the left sidebar
   - Click **Invitation**

3. **Create New Invitation**
   - Click the **"Create new entry"** button (top right)
   - Fill in the form:
     - **Slug**: A unique identifier (e.g., `sarah-and-mike-2025`)
       - Use lowercase letters, numbers, and hyphens only
       - This becomes the URL: `/invitation/sarah-and-mike-2025`
     - **Type**: Select from dropdown (Wedding, Corporate, Birthday, Social)
     - **Title**: Main title (e.g., "Sarah & Michael")
     - **Subtitle**: Subtitle (e.g., "An Invitation to Love")
     - **Date**: Select the event date
     - **Time**: Event time (e.g., "4:00 PM onwards")
     - **Description**: Rich text description of the event
     - **Hero Image**: Upload a beautiful image (click to upload)

4. **Save and Publish**
   - Click **Save** (draft)
   - Click **Publish** to make it live
   - The invitation will be available at: `/invitation/[your-slug]`

### How to Edit an Invitation

1. Go to **Content Manager** → **Invitation**
2. Click on the invitation you want to edit
3. Make your changes
4. Click **Save** then **Publish**

### How to Delete an Invitation

1. Go to **Content Manager** → **Invitation**
2. Click on the invitation
3. Click the **Delete** button (top right)
4. Confirm deletion

## Troubleshooting

### "Cannot connect to Strapi"
- Make sure Strapi server is running
- Check that port 1337 is not in use
- Verify `.env` file has correct configuration

### "Permission denied" when accessing API
- Go to Settings → Users & Permissions → Roles → Public
- Enable "find" and "findOne" for Invitation

### Images not showing
- Make sure Strapi URL in `.env.local` matches your Strapi server
- Check that images are published in Strapi
- Verify API permissions include media access

## Support

For issues or questions, refer to:
- [Strapi Documentation](https://docs.strapi.io)
- Project README.md

