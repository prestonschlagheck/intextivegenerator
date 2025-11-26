# Intextive Generator - Setup Guide

## Overview

The **Intextive Generator** is a streamlined, single-purpose application for AI-powered PDF document processing. It integrates with your n8n workflow, allowing users to upload PDF files with optional instructions and receive intelligent, formatted HTML output.

## 📁 Files Created

### 1. **`app/intextive-upload/page.tsx`**
The main upload page with:
- Clean, modern UI following the existing GLC design system
- PDF file upload with validation
- Optional instructions text area
- Real-time state management (idle, loading, success, error)
- Results display with copy/download functionality
- Full accessibility and responsive design

### 2. **`app/api/run-workflow/route.ts`**
Server-side API route that:
- Proxies requests to your n8n webhook (avoiding CORS issues)
- Validates file type (PDF only)
- Handles errors gracefully
- Returns the HTML response from n8n

## 🚀 How to Access

Once the development server is running, simply visit:

```
http://localhost:3000
```

The home page automatically redirects to the upload interface - there's only one page you need!

## ⚙️ Configuration

### Environment Variable Setup

You need to configure the n8n webhook URL. Create a `.env.local` file in the project root:

```bash
# .env.local
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-workflow-id
```

**Important:** 
- This file should NOT be committed to version control
- The `.env.local` file is automatically ignored by git
- Replace the URL with your actual n8n webhook endpoint

### Restart After Configuration

After creating or updating `.env.local`, restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 📋 How It Works

### User Flow

1. **Upload PDF**: User selects a PDF file from their computer
2. **Add Instructions** (Optional): User can provide special directions for processing
3. **Submit**: User clicks "Run Workflow"
4. **Processing**: The form shows a loading state while processing
5. **Results**: The generated HTML is displayed with options to copy or download

### Technical Flow

```
Browser (Upload Form)
    ↓ POST multipart/form-data
API Route (/api/run-workflow)
    ↓ Validates & forwards
n8n Webhook (N8N_WEBHOOK_URL)
    ↓ Returns JSON { html: "..." }
API Route
    ↓ Returns JSON
Browser (Displays results)
```

### API Contract

**Request to `/api/run-workflow`:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: PDF file (required)
  - `instructions`: Text string (optional)

**Expected Response:**
```json
{
  "html": "<full html output from workflow>"
}
```

**Error Response:**
```json
{
  "error": "Error message describing what went wrong"
}
```

## 🎨 Design Features

The application uses a clean, professional design system:

- **Colors**: 
  - `bluewhale` (dark blue-black) for text
  - `alabaster` (off-white) for background
  - `persian` (teal) for accents and primary buttons
  
- **Components**: Uses existing primitives
  - `Button` with framer-motion animations
  - `Card` with hover effects
  - Consistent spacing and typography

- **Animations**: 
  - Smooth page entrance
  - Loading spinner
  - Animated error/success states
  - Smooth transitions between states

- **Responsive**: Works on desktop, tablet, and mobile

## 🧪 Testing Without n8n

If you want to test the page before configuring n8n:

1. The form validation will work
2. File selection will work
3. Submitting will show an error: "N8N_WEBHOOK_URL is not configured"

To test with a mock endpoint, you could temporarily modify the API route or use a service like RequestBin/Webhook.site for testing.

## 🔒 Security Features

- **Server-side proxy**: The API route prevents CORS issues and keeps your n8n URL secure
- **File validation**: Only PDF files are accepted (validated on both client and server)
- **Error handling**: Comprehensive error handling with user-friendly messages
- **Environment variables**: Sensitive URLs are never exposed to the client

## 🎯 Key Features

### Form Features
- ✅ PDF-only file upload with validation
- ✅ Optional instructions textarea
- ✅ Client-side validation
- ✅ Disabled state during processing
- ✅ Clear error messages

### Results Features
- ✅ HTML preview in scrollable container
- ✅ Copy to clipboard button
- ✅ Download as HTML file button
- ✅ "New Upload" button to reset form

### User Experience
- ✅ Loading states with spinner
- ✅ Error states with detailed messages
- ✅ Success states with results display
- ✅ Smooth animations between states
- ✅ Clean header with "Intextive Generator" branding

## 📝 Customization

### Changing the Page Title
Edit the main heading in `app/intextive-upload/page.tsx`:

```tsx
<h2 className="mb-3 text-4xl font-bold...">
  Transform Your PDF  {/* Change this */}
</h2>
```

### Changing Colors
All colors use the design tokens from `styles/design-tokens.css`:
- `persian`: Primary action color
- `bluewhale`: Text color
- `alabaster`: Background color

### File Size Limits
To add file size validation, modify the `handleFileChange` function in `page.tsx`:

```tsx
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (selectedFile.size > MAX_SIZE) {
  setErrorMessage("File size must be less than 10MB");
  return;
}
```

## 🐛 Troubleshooting

### "N8N_WEBHOOK_URL is not configured"
- Create `.env.local` file in project root
- Add `N8N_WEBHOOK_URL=your-webhook-url`
- Restart the dev server

### "Only PDF files are allowed"
- Make sure you're selecting a PDF file
- Check the file extension is `.pdf`

### "Failed to process workflow"
- Check that your n8n webhook is accessible
- Verify the webhook URL is correct
- Check n8n logs for errors

### CORS Errors
- The API route should handle this automatically
- If issues persist, check your n8n CORS settings

## 📚 Next Steps

1. **Configure n8n**: Set up your webhook URL in `.env.local`
2. **Test**: Upload a test PDF and verify the workflow runs
3. **Customize**: Adjust styling or add features as needed
4. **Deploy**: When ready, add `N8N_WEBHOOK_URL` to your production environment variables

## 🔗 Related Documentation

- Next.js App Router: https://nextjs.org/docs/app
- n8n Webhooks: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- Project README: See `README.md` for general project setup

---

**Need Help?** Check the browser console and terminal for detailed error messages.

