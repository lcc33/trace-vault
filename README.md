# TraceVault – Core Web App

**TraceVault** is a modern lost-and-found platform that helps people report lost or found items, browse reports, submit claims with proof, and connect via email when a claim is approved.

This repository contains the **full functional application** — everything related to user authentication, posting reports, claiming items, approving/rejecting claims, and managing user data.

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

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Auth**: Clerk (Google OAuth)
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Styling**: Tailwind CSS + custom gradients
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)
- **Package Manager**: pnpm

## Project Structure (key folders/files)
src/
├── app/
│   ├── claims/                ← Claims dashboard (made/received)
│   ├── home/                  ← Main feed, report form, search
│   ├── profile/               ← User reports
│   ├── report/[id]/           ← Single report page
│   ├── settings/              ← (placeholder)
│   ├── layout.tsx             ← Root layout
│   └── page.tsx               ← (redirect or proxy)
├── components/
│   ├── home/                  ← ReportCard, ReportForm, etc.
│   ├── ui/                    ← Reusable components (button, card, etc.)
│   └── global/                ← Navbar, container, etc.
├── lib/
│   ├── mongodb.ts             ← MongoDB client
│   ├── auth.ts                ← Optional auth helpers
│   └── utils.ts               ← Helpers
├── api/
│   ├── claims/                ← List, submit, approve/reject claims
│   ├── reports/               ← List, post, get single, user reports
│   └── user/                  ← (user status, etc.)
└── styles/
└── globals.css            ← Tailwind base
text## Environment Variables (.env.local / Vercel)

```env
# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/tracevault?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
Setup & Development

Clone the repo
Install dependenciesBashpnpm install
Create .env.local with the variables above
Start dev serverBashpnpm dev→ http://localhost:3000

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

Future Improvements

Email notifications on claims/approvals
Full-text search indexing
Location-based filtering
Mobile PWA support
Admin dashboard
Analytics

License
MIT
