# User Guide: How to Add Invitations (For Non-Technical Users)

This guide is for team members who need to add or edit invitations in Strapi.

## 🚀 Getting Started

### First Time Setup

1. **Open Strapi Admin Panel**
   - Ask your developer for the Strapi URL (usually: http://localhost:1337/admin)
   - Or if hosted: https://your-strapi-url.com/admin

2. **Login**
   - Enter your email and password
   - (Your developer will provide these credentials)

## 📝 Adding a New Invitation

### Step 1: Navigate to Invitations

1. Look at the left sidebar
2. Click on **"Content Manager"**
3. Click on **"Invitation"**

### Step 2: Create New Entry

1. Click the **"Create new entry"** button (usually top right, green button)

### Step 3: Fill in the Form

Fill in each field:

#### **Slug** ⭐ (Required)
- This is a unique identifier for the invitation
- **Example**: `sarah-and-mike-2025`
- **Rules**:
  - Use lowercase letters only
  - Use hyphens (-) instead of spaces
  - No special characters
  - Must be unique (can't be used twice)
- **This becomes the URL**: `/invitation/sarah-and-mike-2025`

#### **Type** ⭐ (Required)
- Select from the dropdown:
  - Wedding
  - Corporate
  - Birthday
  - Social

#### **Title** ⭐ (Required)
- Main title of the invitation
- **Example**: "Sarah & Michael"
- Can be long text

#### **Subtitle** (Optional)
- Subtitle or tagline
- **Example**: "An Invitation to Love"
- Can be left empty

#### **Date** ⭐ (Required)
- Click the calendar icon
- Select the event date
- **Example**: June 14, 2025

#### **Time** ⭐ (Required)
- Event time
- **Example**: "4:00 PM onwards"
- Or: "7:00 PM - Late"
- Short text

#### **Description** (Optional)
- Rich text description
- You can:
  - Make text **bold** or *italic*
  - Add links
  - Create lists
  - Format text
- **Example**: "Under the starlight of Emerald Valley, we invite you to witness a milestone celebration. Your presence is the greatest gift."

#### **Hero Image** (Optional but Recommended)
- Click the image area or "Click to add an asset"
- Upload a beautiful image
- **Tips**:
  - Use high-quality images
  - Recommended size: 1600x900 pixels or larger
  - Formats: JPG, PNG
  - This is the main image shown at the top of the invitation

### Step 4: Save and Publish

1. **Save as Draft** (optional):
   - Click **"Save"** button
   - This saves but doesn't make it live yet
   - Good for saving work in progress

2. **Publish** (required to make it live):
   - Click **"Publish"** button
   - Confirm by clicking **"Publish"** again
   - ✅ Your invitation is now live!

3. **View the Invitation**:
   - The invitation will be available at: `http://your-website.com/invitation/[your-slug]`
   - Example: `http://your-website.com/invitation/sarah-and-mike-2025`

## ✏️ Editing an Existing Invitation

1. Go to **Content Manager** → **Invitation**
2. Find the invitation you want to edit (use search if needed)
3. Click on it
4. Make your changes
5. Click **"Save"** then **"Publish"**

## 🗑️ Deleting an Invitation

1. Go to **Content Manager** → **Invitation**
2. Click on the invitation you want to delete
3. Click the **"Delete"** button (usually top right, red button)
4. Confirm deletion
5. ⚠️ **Warning**: This cannot be undone!

## 🔍 Finding Invitations

- Use the search bar at the top to find invitations by title or slug
- Use filters to find by type (Wedding, Corporate, etc.)

## 💡 Tips & Best Practices

### Slug Best Practices
- ✅ Good: `sarah-and-mike-2025`, `olivia-birthday-party`
- ❌ Bad: `Sarah & Mike`, `olivia's party`, `event 1`

### Image Tips
- Use high-resolution images for best quality
- Landscape images work best for hero images
- Compress large images before uploading (use tools like TinyPNG)

### Description Tips
- Keep it engaging and personal
- Use formatting to make it readable
- Don't make it too long (2-3 paragraphs is ideal)

### Publishing Checklist
- [ ] Slug is unique and properly formatted
- [ ] All required fields are filled
- [ ] Hero image is uploaded and looks good
- [ ] Description is well-formatted
- [ ] Date and time are correct
- [ ] Clicked "Publish" button

## ❓ Common Questions

**Q: Can I edit an invitation after publishing?**
A: Yes! Just open it, make changes, and click "Publish" again.

**Q: What if I make a mistake in the slug?**
A: You can edit it, but be careful - changing the slug changes the URL. Make sure to update any links.

**Q: Can I unpublish an invitation?**
A: Yes, click "Unpublish" to remove it from the live site without deleting it.

**Q: How do I add multiple images?**
A: Currently, only one hero image is supported. Contact your developer if you need multiple images.

**Q: The invitation isn't showing on the website**
A: Make sure you clicked "Publish" (not just "Save"). Also check that the slug matches the URL.

## 🆘 Need Help?

If you encounter any issues:
1. Check this guide first
2. Contact your developer
3. Take a screenshot of any error messages

---

**Remember**: Always click "Publish" to make your changes live on the website!

