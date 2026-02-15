TraceVault: The Community Security Layer

TraceVault is a high-performance, secure lost-and-found ecosystem built for modern communities and campuses. It replaces chaotic WhatsApp groups with a structured, searchable, and verified recovery platform.

    Status: 🚀 Pre-launch Phase. Optimized for high-latency environments (NG).

⚡ Key Enhancements

    Anti-Spam Shield: Integrated Upstash Redis for sliding-window rate limiting. Enforces a strict 3-post/day and 10-upload/hour policy to prevent platform abuse.

    Fail-Open Architecture: Intelligent rate-limiting logic that allows traffic to flow even if the cache layer faces high latency.

    Aggressive SEO: Optimized metadata for indexing lost and found searches in the West African region.

    Secure Verification: Two-step claim process requiring proof-of-ownership before contact details are revealed.

    Edge-Ready: Configured for Vercel's London (lhr1) region to minimize TTFB for users in Nigeria.

## Tech Stack

Layer Technology
Frontend Next.js 15 (App Router), Tailwind CSS, Framer Motion
Authentication Clerk (Google OAuth & Session Management)
Database MongoDB Atlas (Persistent Storage)
Caching/Limits Upstash Redis (Sliding Window Rate Limiting)
Media Storage Cloudinary (AI-optimized image delivery)
UI Components Shadcn/UI + Lucide React + Radix UI

## Features

- **Google Sign-in** via Clerk (secure, fast, no password hassle)
- **Post Reports** — describe lost/found items with category and optional photo (Cloudinary)
- **Browse & Search** — infinite scroll feed, keyword search, category filters
- **Claim Items** — submit claims with description + proof image (daily limit: 3)
- **Manage Claims** — reporters approve/reject claims on their reports
- **Email Contact** — approved claimers get a pre-filled email template to coordinate return
- **Daily Limits** — 3 reports and 3 claims per user per day (anti-spam)
- **Responsive Design** — works on mobile, tablet, desktop
- **Dark Theme** — modern, clean UI with Tailwind CSS
- **MongoDB** — persistent storage for reports, claims, users, stats
- **Image Uploads** — Cloudinary for secure, optimized images

## Project Structure (key folders/files)

src/
├── app/
│ ├── claims/ ← Claims dashboard (made/received)
│ ├── home/ ← Main feed, report form, search
│ ├── profile/ ← User reports
│ ├── report/[id]/ ← Single report page
│ ├── settings/ ← (placeholder)
│ ├── layout.tsx ← Root layout
│ └── page.tsx ← (redirect or proxy)
├── components/
│ ├── home/ ← ReportCard, ReportForm, etc.
│ ├── ui/ ← Reusable components (button, card, etc.)
│ └── global/ ← Navbar, container, etc.
├── lib/
│ ├── mongodb.ts ← MongoDB client
│ ├── auth.ts ← Optional auth helpers
| |── ratelimit.ts # Upstash Redis implementation
│ └── utils.ts ← Helpers
├── api/
│ ├── claims/ ← List, submit, approve/reject claims
│ ├── reports/ ← List, post, get single, user reports
│ └── user/ ← (user status, etc.)
└── styles/
└── globals.css ← Tailwind base
text## Environment Variables (.env.local / Vercel)

```env
#Log
TRACEVAULT_WEB_URL=...
NEXT_PUBLIC_BASE_URL=..
NEXTAUTH_URL=...
NEXTAUTH_SECRET=....

# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/tracevault?retryWrites=true&w=majority

#Cache
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_REDIS_REST_TOKEN

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
Setup & Development

Clone the repo
Install dependencies "pnpm install"
Create .env.local with the variables above
Start dev server pnpm dev→ http://localhost:3000

Deployment (Vercel)

Push to GitHub
Import repo in Vercel dashboard
Add environment variables
Deploy

Recommended domain: app.tracevault.xyz (subdomain of your main domain)
Important Notes

Daily Limits: Enforced at 3 reports and 3 claims per user per day (tracked in userStats collection)
Security: All API routes use Clerk auth middleware
Image Limits: Max 8MB, only JPEG/PNG/WEBP
No phone numbers: Email-only contact (security decision)

Deployment

    Vercel Configuration:

        Set Framework Preset to Next.js.

        Override Output Directory if using a custom build script.

        Region: Set to London (lhr1) for optimal latency to Nigeria.

    Database Indexing:
    Run the setup script to ensure search performance:
    Bash

    pnpm ts-node scripts/setup-indexes.ts

🛣️ Roadmap

    [x] Sliding Window Rate Limiting

    [x] Responsive Sidebar with Hover Logic

    [ ] Email/Push notifications for claim approvals

    [ ] Location-based "Radius Search"

    [ ] AI-powered image matching (Lost vs Found)

    [ ] Mobile PWA (Progressive Web App) Support

📄 License

Licensed under the MIT License. Created with intention by the TraceVault Team.
```
