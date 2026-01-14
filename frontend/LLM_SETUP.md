# LLM API Keys Setup Guide

This guide will help you set up API keys for the scrapbook generation feature, which uses LLM (Large Language Model) to organize and categorize scrapbook entries.

## Quick Start

1. **Choose a provider** (Gemini or Groq)
2. **Get an API key** from your chosen provider
3. **Add it to `.env.local`** in the frontend directory
4. **Restart your Next.js dev server**

---

## Option 1: Google Gemini (Recommended for Quality)

### Step 1: Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 2: Add to `.env.local`

Create or edit `frontend/.env.local`:

```bash
# LLM Configuration
LLM_PROVIDER=gemini
GOOGLE_AI_API_KEY=your-actual-api-key-here

# Optional: Choose Gemini model (default: gemini-1.5-flash)
# Options: gemini-1.5-flash (faster) or gemini-1.5-pro (better quality)
# GEMINI_MODEL=gemini-1.5-flash
```

### Step 3: Restart Dev Server

```bash
cd frontend
npm run dev
```

**Note:** Gemini has a free tier with generous limits. Check [pricing](https://ai.google.dev/pricing) for details.

---

## Option 2: Groq (Recommended for Speed)

### Step 1: Get API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up or sign in
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 2: Add to `.env.local`

Create or edit `frontend/.env.local`:

```bash
# LLM Configuration
LLM_PROVIDER=groq
GROQ_API_KEY=your-actual-api-key-here
```

### Step 3: Restart Dev Server

```bash
cd frontend
npm run dev
```

**Note:** Groq offers a free tier and is very fast. Great for testing!

---

## Testing Your Setup

### Method 1: Generate a Scrapbook

1. Make sure you have:
   - Strapi running on `http://localhost:1337`
   - Some invitations and scrapbook entries in Strapi
   - (Use the seed script if needed: `node frontend/scripts/seed-scrapbook.js`)

2. Navigate to: `http://localhost:3000/scrapbook`

3. Click **"Generate Scrapbook"** for an invitation

4. Check the browser console and terminal for any errors

### Method 2: Check API Route Directly

You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/scrapbook/generate \
  -H "Content-Type: application/json" \
  -d '{"invitationSlug": "your-invitation-slug"}'
```

---

## Troubleshooting

### Error: "LLM organization failed, falling back to heuristic"

**Meaning:** The LLM call failed, but the system will still work using basic heuristics.

**Possible causes:**
- API key is missing or incorrect
- API key doesn't have proper permissions
- Rate limit exceeded
- Network issues

**Solutions:**
1. Verify your API key is correct in `.env.local`
2. Make sure you restarted the dev server after adding the key
3. Check the terminal for detailed error messages
4. Try the other provider (Gemini ↔ Groq)

### Error: "models/gemini-pro is not found" or "404 Not Found"

**Meaning:** The old `gemini-pro` model is deprecated and no longer available.

**Solution:**
- ✅ **Fixed!** The code now uses `gemini-1.5-flash` by default (faster) or `gemini-1.5-pro` (better quality)
- Make sure you have the latest code
- If you still see this error, restart your dev server:
  ```bash
  # Stop the server (Ctrl+C) and restart
  npm run dev
  ```
- Optional: You can specify a different model in `.env.local`:
  ```bash
  GEMINI_MODEL=gemini-1.5-pro  # For better quality
  # or
  GEMINI_MODEL=gemini-1.5-flash  # For faster responses (default)
  ```

### Error: "Missing API key"

**Solution:**
- Make sure `.env.local` exists in the `frontend/` directory
- Verify the variable name matches exactly (case-sensitive):
  - `GOOGLE_AI_API_KEY` for Gemini
  - `GROQ_API_KEY` for Groq
- Restart your Next.js dev server

### LLM Not Working? No Problem!

The scrapbook generation will still work without LLM! It will:
- Use basic heuristics to organize entries
- Still categorize by relation
- Still extract highlights
- Just won't have AI-powered content moderation

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LLM_PROVIDER` | No | Which LLM to use: `gemini` or `groq` | `gemini` |
| `GOOGLE_AI_API_KEY` | Yes* | Google Gemini API key | `AIza...` |
| `GROQ_API_KEY` | Yes* | Groq API key | `gsk_...` |

*Required only if you want to use that provider.

---

## Which Provider Should I Choose?

### Choose **Gemini** if:
- ✅ You want the best quality categorization
- ✅ You have a Google account
- ✅ You don't mind slightly slower responses

### Choose **Groq** if:
- ✅ You want the fastest responses
- ✅ You're testing/developing
- ✅ You want a free tier with good limits

### Use **Neither** if:
- ✅ You just want basic scrapbook generation
- ✅ You don't need AI-powered organization
- ✅ You want to avoid API costs

The system will work fine without LLM, just with simpler organization logic.

---

## Security Notes

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`.

✅ API keys are server-side only (not exposed to the browser)

✅ Keys are only used in Next.js API routes (`/api/scrapbook/generate`)

---

## Need Help?

- Check the terminal/console for error messages
- Verify your API key is active in the provider's dashboard
- Make sure Strapi is running and accessible
- Try generating a scrapbook with just a few entries first
