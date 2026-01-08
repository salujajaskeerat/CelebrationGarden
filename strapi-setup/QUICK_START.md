# 🚀 Quick Start Guide - Strapi Setup

Get Strapi up and running in 5 minutes!

## Step 1: Run Setup Script

```bash
cd strapi-setup
./setup.sh
```

Or manually:
```bash
npx create-strapi-app@latest celebration-garden-cms --quickstart
```

## Step 2: Create Admin Account

When Strapi opens in your browser:
- Enter your email
- Create a password
- Click "Let's start"

## Step 3: Import Content Type

1. Go to **Settings** (gear icon, bottom left)
2. Click **Import/Export** → **Import**
3. Select `invitation-content-type.json` from this folder
4. Click **Import**

✅ The "Invitation" content type is now created!

## Step 4: Set Permissions

1. Go to **Settings** → **Users & Permissions Plugin**
2. Click **Roles** → **Public**
3. Scroll to **Invitation**
4. Check ✅ **find** and ✅ **findOne**
5. Click **Save**

✅ API is now accessible!

## Step 5: Start Adding Invitations

1. Go to **Content Manager** → **Invitation**
2. Click **Create new entry**
3. Fill in the form
4. Click **Publish**

🎉 Done! Your invitation is live!

---

**Need help?** See `USER_GUIDE.md` for detailed instructions for non-technical users.

