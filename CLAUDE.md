# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the DAHOUSE website - a corporate site for a digital services company offering applications, consulting, supervision, and IoT solutions. Built with Next.js 15, deployed as a static export on Cloudflare Pages with serverless functions for contact form handling.

**Production URL**: https://dahouse.fr

## Development Commands

### Core Commands
```bash
# Development server (http://localhost:3000)
npm run dev

# Production build (static export to /out)
npm run build

# Lint code
npm run lint

# Start production server (for testing build locally)
npm start
```

### Cache & Server Management
```bash
# Clean cache and restart dev server
rm -rf .next && npm run dev

# Kill process on port 3000 (if stuck)
lsof -ti:3000 | xargs kill -9

# Clean all caches (use when build corrupts)
rm -rf .next node_modules/.cache out
```

### Deployment Testing
```bash
# Test Cloudflare Pages Functions locally (requires wrangler)
npm install -D wrangler
npx wrangler pages dev out --compatibility-date=2024-01-01
```

## Architecture

### Next.js Configuration
- **Output mode**: Static export (`output: "export"`)
- **Images**: Unoptimized (required for static export)
- **Trailing slash**: Disabled
- **Deployment**: Cloudflare Pages with serverless functions in `/functions`

### Design System
**Color Palette**: Deep Titanium theme
- Background: `#0B0F14` (very dark blue-gray)
- Foreground: `#E6EAF0` (light gray-blue)
- Accent: Indigo/Purple gradients

**Typography**:
- Sans: Inter (`--font-sans`)
- Display: Sora (`--font-display`) - used for headings
- Mono: JetBrains Mono (`--font-mono`) - used for technical labels

**Visual Effects**:
- Glassmorphism: `.glass` and `.glass-card` utilities
- Animations: Framer Motion for page transitions and scroll reveals
- Custom utilities: `.gradient-text`, `.aurora-bg`

### Page Structure

**Main Pages**:
- `/` - Homepage with hero, 4 service features, use cases, methodology, CTA
- `/offres` - Services page with expandable modal cards (4 offerings)
- `/contact` - Contact form with custom animated select (posts to `/api/contact`)
- `/client` - Client portal links (App2, PTO Tracker, Géosignal)
- Legal pages: `/mentions-legales`, `/cgu`, `/confidentialite`

**Homepage Sections Order**:
1. Hero - Main value proposition
2. Features - 4 service offerings (cards with tags)
3. UseCases - "Du bricolage à l'outil" (3 concrete examples)
4. Methodology - "Une méthode simple" (5-step process)
5. CTA - Diagnostic offer

**Layout Hierarchy**:
```
RootLayout (src/app/layout.tsx)
├── GoogleAnalytics (loads conditionally based on cookie consent)
├── Navbar (fixed top, glassmorphism)
├── {children} (page content)
├── Footer (links to legal pages, social)
└── CookieBanner (consent management for analytics)
```

### Component Organization

**UI Components** (`src/components/ui/`):
- `Hero.tsx` - Homepage hero ("Des systèmes utiles. Qui tournent.")
- `Features.tsx` - 4 simplified service cards (title + tagline + 3 tags + link)
- `UseCases.tsx` - Concrete use cases section (3 examples)
- `Methodology.tsx` - 5-step process (Cadrage → Prototype → MVP → Industrialisation → Run)
- `CTA.tsx` - Diagnostic-focused call-to-action
- `Navbar.tsx` - Top navigation (Offres, Contact, Espace Client)
- `Footer.tsx` - Site footer
- `CookieBanner.tsx` - RGPD-compliant cookie consent
- `Stats.tsx` - Available but not used on homepage

**Analytics** (`src/components/analytics/`):
- `GoogleAnalytics.tsx` - Conditionally loads GA based on consent
- `src/lib/analytics.ts` - Helper functions for tracking

### Serverless Functions (Cloudflare Pages)

**Contact Form API** (`functions/api/contact.ts`):
- Endpoint: `/api/contact` (POST)
- Email provider: **Resend** (modern email API)
- Validation: Email format, required fields
- Target: `oscar@dahouse.fr`
- Sender: `DAHOUSE Contact <contact@dahouse.fr>`
- Features: HTML email template, reply-to handling, CORS support

**Important**:
- Cloudflare Pages Functions only work in production or with Wrangler locally
- They do NOT work with `npm run dev`
- Local testing: Use `.dev.vars` file for environment variables

### Key Content Details

**Service Offerings** (must stay aligned between homepage and `/offres`):
1. **Applications métier** - Custom business apps (no "sur-mesure")
2. **Conseil & cadrage** - Consulting and roadmap planning
3. **Supervision** - Monitoring and operations (no "& maintien opérationnel")
4. **Objets connectés** - IoT and home automation (no "(maison & bâtiments)")

**Key Messaging**:
- Hero: "Des systèmes utiles. Qui tournent."
- Subtitle: "On transforme vos processus et votre infrastructure en solutions fiables : applications métier, supervision, objets connectés, et cadrage pragmatique."
- CTA: "Décrivez votre contexte en 10 lignes." → Focus on diagnostic offering

**Example Projects**:
- Géosignal (mentioned in Applications métier)
- Use cases section provides 3 concrete transformation examples

### Environment Variables

**Required for Production**:
- `RESEND_API_KEY` - Resend API key for email sending (set in Cloudflare Pages dashboard)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID (currently: `G-RTCVK15RF0`)

**Local Development** (`.dev.vars`):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Note: `.dev.vars` is in `.gitignore` and should never be committed

### Email Configuration

**Resend Setup**:
1. Domain `dahouse.fr` must be verified on Resend
2. DNS records (SPF, DKIM) configured on Cloudflare
3. API key stored as environment variable on Cloudflare Pages
4. See `RESEND_SETUP.md` for detailed instructions

**Email Flow**:
```
User submits form → /api/contact → Cloudflare Function → Resend API → oscar@dahouse.fr
```

## Common Issues

### Cache Corruption (500 errors)
If you see errors like `ENOENT: routes-manifest.json`:
```bash
rm -rf .next out && npm run build
```

### Contact Form Testing
- `/api/contact` endpoint only works on Cloudflare Pages or with Wrangler
- NOT available with `npm run dev`
- Test locally: `npx wrangler pages dev out --compatibility-date=2024-01-01`
- Make sure `RESEND_API_KEY` is set in `.dev.vars` for local testing

### Form Reset Error
If you see "Cannot read properties of null (reading 'reset')":
- This is a build cache issue
- Clear `.next` and `out` directories
- Rebuild and redeploy
- The form reference is now properly stored before async operations

### Static Export Limitations
- No server-side rendering (SSR)
- No API routes in `/app/api` (use `/functions` instead)
- Images must be unoptimized
- Dynamic routes must be pre-generated

## SEO & Metadata

**Site Title**: "DAHOUSE — Apps métier, supervision & objets connectés"
**Description**: "On transforme vos process (Excel/mails) en outils web/mobile exploitables : workflow, reporting, supervision et MCO."

**OpenGraph Configuration**:
- Properly configured in `src/app/layout.tsx`
- Includes title, description, URL, locale, and type
- Twitter card support included

## Legal & Analytics

- Cookie consent is required before loading Google Analytics
- Legal pages are RGPD-compliant
- Analytics helper functions check consent before tracking
- Consent stored in localStorage as "cookieConsent"

## Brand Guidelines

**Tone**: Professional, pragmatic, no-nonsense. Focus on operational excellence and practical results.

**Key messaging principles**:
- "Des systèmes utiles. Qui tournent." (Useful systems. That work.)
- Emphasis on adoption, maintenance, and long-term viability
- "Idéal si:" sections target specific pain points
- "Du bricolage à l'outil" - transformation focus
- Diagnostic-first approach (CTA)

**Visual style**: Dark titanium palette, glassmorphism effects, subtle animations, clean typography.

## Git Workflow

**Branches**:
- `main` - Production branch (deployed to dahouse.fr)
- `new-ui` - Development branch (merge to main when ready)

**Deployment**:
- Cloudflare Pages auto-deploys from `main` branch
- Build command: `npm run build`
- Output directory: `out`
- Functions directory: `functions`
