<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Celebration Garden - Luxury Wedding Venue

A premium, high-conversion landing page for Celebration Garden, built with Next.js 14.

## Run Locally

**Prerequisites:** Node.js 18+ and npm

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Strapi CMS:
   
   **Quick Setup (Recommended):**
   ```bash
   cd strapi-setup
   chmod +x setup.sh
   ./setup.sh
   ```
   Then follow the instructions in `strapi-setup/README.md`
   
   **Manual Setup:**
   - Install Strapi locally: `npx create-strapi-app@latest my-strapi-project`
   - Or use Strapi Cloud at [strapi.io](https://strapi.io)
   - Import the content type from `strapi-setup/invitation-content-type.json`
   - Configure API permissions in Strapi Settings > Users & Permissions Plugin > Roles > Public
     - Enable "find" and "findOne" for Invitation content type
   
   **For detailed setup instructions, see:** `strapi-setup/README.md`
   
   **For non-technical users guide, see:** `strapi-setup/USER_GUIDE.md`
   
   - Create a `.env.local` file in the root directory:
     ```env
     NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
     STRAPI_API_TOKEN=your-api-token  # Optional, for protected endpoints
     NEXT_PUBLIC_WHATSAPP_PHONE=1234567890  # Your WhatsApp number (with country code, no + or spaces)
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Deploy to AWS EC2

**Complete deployment guide available:** See `deployment/DEPLOYMENT_GUIDE.md`

**Quick Start:**
1. Follow `deployment/QUICK_START.md` for fast deployment
2. Or use the detailed `deployment/DEPLOYMENT_GUIDE.md` for step-by-step instructions

**What's included:**
- PostgreSQL database setup
- Strapi CMS deployment
- Next.js application deployment
- Nginx reverse proxy configuration
- SSL certificate setup (Let's Encrypt)
- PM2 process management
- Automated backup scripts

**Cost:** Free for 12 months (AWS Free Tier), then ~$11-14/month

## Project Structure

- `app/` - Next.js App Router directory
  - `layout.tsx` - Root layout with metadata and global styles
  - `page.tsx` - Home/landing page
  - `invitation/[slug]/page.tsx` - Dynamic route for invitation pages
  - `api/invitation/[slug]/route.ts` - API route to fetch invitation data from Strapi
  - `globals.css` - Global styles and Tailwind CSS
- `components/` - React components
  - `ClientInvitation.tsx` - Main invitation component that fetches and displays data
- `lib/` - Utility libraries
  - `strapi.ts` - Strapi API client configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Features

- Modern Next.js 14 App Router
- Server-side rendering and static generation
- Dynamic routes for invitation pages
- **Strapi CMS integration** - Manage invitation content through Strapi
- **WhatsApp integration** - Fixed WhatsApp button for mobile users with pre-filled messages
- API routes for fetching invitation data
- Tailwind CSS for styling
- TypeScript support
- Responsive design

## Strapi CMS Integration

The invitation pages are powered by Strapi CMS. When a user visits `/invitation/[slug]`, the app:

1. Fetches data from Strapi using the slug via the API route `/api/invitation/[slug]`
2. Dynamically renders the invitation with the fetched data
3. Supports all invitation fields: title, subtitle, date, time, description, and hero image

To create a new invitation:
1. Go to your Strapi admin panel (usually at `http://localhost:1337/admin`)
2. Navigate to Content Manager > Invitation
3. Click "Create new entry"
4. Fill in the slug (e.g., `sarah-and-mike`) - this will be the URL path
5. Fill in all the invitation fields
6. Click "Save" and then "Publish"
7. Visit `/invitation/[your-slug]` to see the invitation
