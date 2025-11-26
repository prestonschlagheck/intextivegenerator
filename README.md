# Intextive Generator

AI-powered PDF document processing application built with Next.js 14, Tailwind CSS, and shadcn/ui primitives. Upload PDFs with optional instructions and receive intelligent, formatted output through an n8n workflow integration.

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + CSS variables powered design tokens
- shadcn/ui primitives refined to match the brand system
- Framer Motion for performant micro-interactions
- Phosphor Icons for consistent iconography
- Zustand for lightweight admin dashboard state
- next-seo for default SEO metadata

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000` (automatically redirects to the upload page).

### Useful Scripts

- `npm run dev` – start the local dev server
- `npm run build` – create a production build
- `npm run start` – run the production build locally
- `npm run lint` – lint all files with ESLint
- `npm run type-check` – verify TypeScript types
- `npm run format` / `npm run format:write` – check or write Prettier formatting

## Project Structure

### Core Application
- `app/page.tsx` – redirects to the main upload page
- `app/intextive-upload/page.tsx` – main PDF upload interface with n8n workflow integration
- `app/api/run-workflow/route.ts` – API route that proxies requests to n8n webhook (avoids CORS)

### Design System
- `components/primitives/` – animated wrappers for buttons, cards, and UI elements
- `components/ui/` – shadcn-derived Radix UI components
- `styles/design-tokens.css` – design tokens for colors, typography, spacing, and animations

### Additional Pages (Legacy)
- `app/admin/` – admin dashboard (can be removed if not needed)
- `app/components/marketing/` – marketing components (can be removed if not needed)

## Features

### PDF Processing
- ✅ Upload PDF documents with validation
- ✅ Optional processing instructions
- ✅ Real-time loading states
- ✅ Error handling with user-friendly messages
- ✅ Results display with HTML preview
- ✅ Copy to clipboard functionality
- ✅ Download results as HTML file

### Design & UX
- Clean, modern interface with persian teal and bluewhale color scheme
- Typography: DM Sans with custom scale
- Smooth animations powered by Framer Motion
- Fully responsive design (mobile, tablet, desktop)
- Accessible with keyboard navigation and screen reader support

## How It Works

1. **User uploads a PDF** with optional processing instructions
2. **Form submits** to the local `/api/run-workflow` endpoint
3. **API route proxies** the request to your n8n webhook (configured via `N8N_WEBHOOK_URL`)
4. **n8n processes** the PDF and returns JSON with an `html` field
5. **Results display** on the page with copy/download options

## Deployment

The project is optimized for Vercel:

1. `npm run build`
2. Deploy the `.next` output with Vercel or any Node-compatible platform

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# n8n Workflow Configuration
# The webhook URL endpoint for your n8n workflow
# Example: https://your-n8n-instance.com/webhook/your-workflow-id
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-workflow-id
```

## API Integration

Your n8n workflow webhook should:
- Accept `POST` requests with `multipart/form-data`
- Expect two fields:
  - `file`: The uploaded PDF file
  - `instructions`: Text string with processing instructions (can be empty)
- Return JSON in this format:
  ```json
  {
    "html": "<your generated HTML output>"
  }
  ```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Add the `N8N_WEBHOOK_URL` environment variable
4. Deploy!

### Other Platforms
Any Node.js hosting platform that supports Next.js will work:
1. `npm run build` to create production build
2. Set `N8N_WEBHOOK_URL` environment variable
3. Deploy the `.next` output with `npm start`
