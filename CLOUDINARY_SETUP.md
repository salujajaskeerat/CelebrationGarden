# Cloudinary Setup for Scrapbook Images

## Quick Answer

**No API key needed!** Only the cloud name and upload preset name are required.

## Why No API Key?

Cloudinary supports **unsigned uploads** using upload presets. When you create an unsigned preset, Cloudinary handles authentication automatically. This is perfect for client-side uploads where you don't want to expose API keys.

## Required Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

**That's it!** No API key, no secret, just these two values.

## Cloudinary Upload Preset Configuration

### Step 1: Create Upload Preset

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload**
3. Scroll to **Upload presets** section
4. Click **Add upload preset**

### Step 2: Configure Preset (WITH Transformations!)

**Important:** For unsigned uploads, transformations MUST be in the preset, not in the code!
Cloudinary doesn't allow `transformation` parameter with unsigned uploads.

**Basic Settings:**
- **Preset name**: `ml_default` (or match your env var)
- **Signing mode**: **Unsigned** ⚠️ (This is critical!)
- **Folder**: `celebration-garden/scrapbook` (optional)

**Incoming Transformation (REQUIRED):**
1. Scroll to **"Incoming Transformation"** section
2. Click **"Edit"** or **"+"** to add transformation
3. Set these values:
   - **Format**: `jpg` (single format only)
   - **Quality**: `80`
   - **Width**: `1920` (max width)
   - **Height**: `1920` (max height)
   - **Crop**: `limit` (maintains aspect ratio)

**Why transformations in preset?**
- Cloudinary requires transformations in preset for unsigned uploads
- This preset is specifically for scrapbook images
- Ensures single JPEG format only (no multiple versions)
- Other images use different presets/upload methods

### Step 3: Save Preset

Click **Save** and you're done!

## Why Single Format?

Scrapbook images are:
- ✅ Rarely accessed (archived memories)
- ✅ Don't need responsive images
- ✅ Don't need multiple formats (WebP, AVIF, etc.)
- ✅ Storage efficient (one file per image)

This saves:
- **Storage space** - No duplicate formats
- **Processing time** - No format conversion
- **Bandwidth** - Smaller uploads

## Security Note

Even though no API key is needed, the upload preset can be restricted:
- **Allowed file types**: Images only
- **Max file size**: Set a reasonable limit (e.g., 10MB)
- **Folder restrictions**: Limit to specific folders

## Testing

After setup, test the upload:

1. Fill out scrapbook form
2. Select an image
3. Submit form
4. Check browser console for Cloudinary URL
5. Verify image appears in Cloudinary Media Library

## Troubleshooting

**"Invalid upload preset" error:**
- Verify preset name matches env var exactly
- Check preset is set to "Unsigned"
- Ensure preset is saved and active

**"Upload failed" error:**
- Check cloud name is correct
- Verify preset exists in Cloudinary
- Check browser console for detailed error

**Multiple formats being created:**
- Verify preset has "Responsive breakpoints" disabled
- Check "Eager transformations" is empty
- Ensure code uses single transformation parameter
