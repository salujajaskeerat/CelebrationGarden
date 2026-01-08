# Admin Interface Guide - Scrapbook PDF Generation

## Overview

A simple admin interface has been created for your team to generate PDF scrapbooks without any technical knowledge.

## Access the Admin Interface

**URL:** `http://localhost:3000/admin/scrapbook`

(Replace `localhost:3000` with your production URL when deployed)

## Features

### 1. View All Invitations
- See all events with their details
- View entry counts for each invitation
- See which events have passed (ready for PDF generation)

### 2. Generate PDF Scrapbooks
- One-click PDF generation
- Beautiful formatted scrapbook with all guest entries
- Automatic print dialog for easy saving

### 3. Status Indicators
- **Event Passed** (Green) - Event date has passed, ready for scrapbook
- **Upcoming** (Yellow) - Event is still in the future
- Entry count shows how many contributions are included

## How to Use

### Step 1: Access the Admin Page
1. Open your browser
2. Navigate to: `http://localhost:3000/admin/scrapbook`
3. You'll see a table of all invitations

### Step 2: Generate a PDF
1. Find the invitation you want to create a scrapbook for
2. Check that it has entries (entry count > 0)
3. Click the **"Generate PDF"** button
4. A new window will open with the formatted scrapbook
5. Your browser's print dialog will appear automatically
6. Choose **"Save as PDF"** as the destination
7. Save the file with a meaningful name (e.g., "Sarah-Mike-Wedding-Scrapbook.pdf")

### Step 3: Share the PDF
- Email the PDF to guests
- Share via WhatsApp (especially for guests who provided phone numbers)
- Upload to cloud storage (Google Drive, Dropbox) and share the link

## What's Included in the PDF

Each PDF scrapbook includes:
- **Cover Page**: Event title, date, and "Digital Scrapbook" header
- **Guest Entries**: Each entry shows:
  - Guest name
  - Photo (if provided) or initial letter
  - Message/wish
  - Submission date

## Troubleshooting

### "Generate PDF" button is disabled
- **Reason**: The invitation has no scrapbook entries yet
- **Solution**: Wait for guests to submit entries, or test by submitting a test entry

### PDF doesn't open
- Check your browser's pop-up blocker settings
- Try a different browser (Chrome, Firefox, Safari)
- Check browser console for errors

### Entries not showing in PDF
- Verify entries exist in Strapi: **Content Manager** → **Scrapbook Entry**
- Check that entries are linked to the correct invitation
- Refresh the admin page

### Print dialog doesn't appear
- Manually click the browser's print button (Ctrl+P / Cmd+P)
- Or right-click the page → Print

## Tips for Best Results

1. **Wait until after the event** to generate the final scrapbook (more entries)
2. **Review entries in Strapi** before generating to ensure quality
3. **Test with a few entries first** to see the format
4. **Use Chrome or Firefox** for best PDF generation results
5. **Save multiple versions** if you want to update as more entries come in

## Security Note

⚠️ **Important**: This admin page is currently accessible to anyone. For production:

1. Add authentication (password protection)
2. Or restrict access by IP address
3. Or add a simple password check

**Quick Password Protection** (Optional):
- Add a simple password check in the page component
- Or use Next.js middleware for route protection
- Or deploy behind a login system

## Future Enhancements

Potential improvements:
- [ ] Direct PDF download (without print dialog)
- [ ] Email PDF directly to guests
- [ ] WhatsApp integration for automatic sending
- [ ] Custom PDF templates
- [ ] Batch generation for multiple events
- [ ] PDF preview before download

---

**Need Help?** Contact your developer or refer to the main setup documentation.

