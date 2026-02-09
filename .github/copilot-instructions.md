# Copilot Instructions for DoubleOExperience

## Project Overview
DoubleOExperience is a **Next.js 14 wedding website** built with React 18, TypeScript, and Tailwind CSS. It's a client-side heavy application celebrating a wedding with sections for event details, photo galleries, RSVPs, and a gift wish list.

### Tech Stack
- **Framework**: Next.js 14.2.5 with App Router
- **React**: Version 18.2.0 with hooks-based components
- **Styling**: Tailwind CSS 4 with PostCSS, Inter font family
- **Type Safety**: TypeScript 5 with strict mode enabled
- **Image Optimization**: Next.js `<Image>` component with error handling
- **Tooling**: ESLint 9 with Next.js core-web-vitals config

## Architecture & Key Patterns

### File Structure
```
app/
  ├── layout.tsx                 # Root layout (34 lines) - Navigation/Footer wrappers, Google Fonts
  ├── page.tsx                   # Home page (501 lines, complex multi-section)
  ├── globals.css                # Tailwind directives and global styles
  ├── components/
  │   ├── Navigation.tsx         # Smart nav (160 lines) - hash-based section scrolling
  │   └── Footer.tsx             # Static footer with year display
  ├── contact/page.tsx           # Contact page
  ├── events/page.tsx            # Events details page
  ├── gallery/page.tsx           # Gallery page
  ├── our-story/page.tsx         # Our story dedicated page (placeholder)
  ├── rsvp/page.tsx              # RSVP dedicated page
  └── wish-list/page.tsx         # Gift wish list (238 lines) with gift items and account details modal
```

### Page Structure Breakdown
- **Home page** (`page.tsx`, 501 lines): Largest file, contains 8+ sections with sticky sections, gallery (28 images), forms, and embedded RSVP modal
- **Wish List page** (`wish-list/page.tsx`, 238 lines): 13-item gift list with account copy-to-clipboard functionality
- **Other pages**: Minimal SSR-only pages (Contact, Events, Gallery, RSVP dedicated page)
- **Layout** (`layout.tsx`, 29 lines): Root wrapper with Inter font, flex column for sticky footer

### Critical Design Decisions

#### 1. **Hybrid Routing Strategy**
- **Home page (`/`) is anchor-based**: Navigation items use hash fragments (`#our-story`, `#home`, etc.) for smooth in-page scrolling when on home page
- **Dedicated routes** for `/events`, `/rsvp`, `/gallery`, `/wish-list`, `/contact`, `/our-story`
- Navigation intelligently handles both: if clicking a section link from another page, it redirects to `/#section-id`
- See [Navigation.tsx](app/components/Navigation.tsx#L34-L50) for the navigation logic that distinguishes routes vs. sections
- **Navigation data structure** (line 7-13): Each nav item has `label`, `href`, `sectionId`, and `isRoute` flag

#### 2. **Client-Side Rendering with Hydration Safety**
- Pages use `'use client'` directive for interactive state ([page.tsx](app/page.tsx#L1), [Navigation.tsx](app/components/Navigation.tsx#L1), [wish-list](app/wish-list/page.tsx#L1))
- Enables interactive state: RSVP modals, mobile menu toggles, form handling, image error states
- **Critical hydration pattern**: [Navigation.tsx](app/components/Navigation.tsx#L26-L35) defers hash reading until after mount via `useEffect` to prevent SSR mismatches
- Home page handles hash-based scrolling on load with timeout ([page.tsx](app/page.tsx#L190-L198)) to ensure DOM ready

#### 3. **Layout Structure & Sticky Footer**
- [layout.tsx](app/layout.tsx) wraps all pages with:
  - Google Fonts (Inter) via `next/font/google`
  - Navigation component at top (sticky, z-50)
  - Main content area with `flex-1` to expand
  - Footer component at bottom
- Body uses flexbox (`flex flex-col min-h-screen`) to ensure footer stays at bottom on short pages

### Component Patterns

**Navigation** ([Navigation.tsx](app/components/Navigation.tsx), 160 lines)
- Tracks current route via `usePathname()` and hash via `setCurrentHash()`
- Has mobile menu toggle state for responsive design
- Each nav item has `isRoute` flag: `true` for dedicated pages, `false` for anchor sections
- Mobile nav items trigger `handleNavClick()` which either:
  - Scrolls to section if on home (`/#section-id`)
  - Redirects with hash if on another page (`window.location.href = /#section-id`)
- Active state logic (lines 53-63): Handles both routes and sections, with SSR-safe fallbacks

**RSVP Modal** (in [page.tsx](app/page.tsx#L7-L9), 170+ lines)
- Self-contained functional component with three state modes: `'initial' | 'attending' | 'not-attending'`
- State resets when modal closes to prevent stale data
- Form handling with `handleSubmit(e: React.FormEvent)` redirects to `/wish-list` after submission
- Image error handling: Falls back to `bg-black/50` if `/couple-background.jpg` fails to load
- Uses `Image` component with `onError` callback for graceful degradation

**Gallery** (lines 417-456 in [page.tsx](app/page.tsx))
- 28 images mapped from `PIC1.jpeg` through `PIC28.jpeg` in `/public`
- Lazy loading: Images use `loading="lazy"` with responsive `sizes` prop
- Error handling: Failed images tracked in `galleryImageErrors` Set, displays fallback text with filename
- Responsive grid: 1 column mobile, 2 tablet, 3 md screens, 4 lg screens

**Wish List Modal** (in [wish-list/page.tsx](app/wish-list/page.tsx#L30), 50+ lines)
- Account details modal with copy-to-clipboard for account number
- Uses `navigator.clipboard` API with fallback to `document.execCommand('copy')` for older browsers
- Shows visual feedback (`copied` state) for 2 seconds after successful copy

**Our Story Section** (lines 249-371 in [page.tsx](app/page.tsx))
- Two-column sticky layout for images: `lg:sticky lg:top-24` keeps images fixed while text scrolls
- Separate image error states for `herStoryImageError` and `hisStoryImageError`
- Responsive: Image on left/right alternates via `lg:flex-row` / `lg:flex-row-reverse`

## Development Workflow

### Key Commands
```bash
npm run dev       # Start dev server on http://localhost:3000 (hot reload)
npm run build     # Production build to .next/
npm start         # Run production build locally
npm run lint      # Run ESLint on all files
```

### Development Tips
- Next.js watches `app/` directory for auto-reload
- Edit [page.tsx](app/page.tsx) to update home page
- Add new routes by creating files in `app/[route-name]/page.tsx`
- Images in `public/` directory (e.g., `/couple-background.jpg`, `/favicon.ico`, `/PIC1.jpeg` through `/PIC28.jpeg`)
- Tailwind classes are auto-completed in `.tsx` files via @tailwindcss/postcss
- Mobile responsiveness follows: `hidden md:flex` (hide on mobile, show on medium+), `md:hidden` (show on mobile, hide on medium+)

### Image Management
- **Required for home page**: `/couple-background.jpg` (RSVP modal and page background)
- **Story section**: `/herstory.jpeg`, `/hisstoy.jpeg` (note: typo in filename is intentional)
- **Wedding invitation**: `/wedding-invitation.jpg.jpeg` (note: double extension needed)
- **Gallery**: `/PIC1.jpeg` through `/PIC28.jpeg` (28 images for gallery grid)
- All images have error handlers that display helpful fallback text with expected filename and folder path

### Type Safety
- ESLint configured with TypeScript strict mode (`"strict": true` in tsconfig.json)
- Import types with `import type { ComponentType } from 'react'`
- Props typed as `React.ReactNode` for children, not `any`
- Use `Readonly<{}>` wrapper for immutable props (see [layout.tsx](app/layout.tsx#L26-L29))
- Component states typed with union types (e.g., `'initial' | 'attending' | 'not-attending'`) instead of strings
- Set types used for tracking errors: `Set<number>` for gallery image errors

## Project-Specific Conventions

### Styling Conventions
- **Font**: Inter font family (imported from Google Fonts in layout)
- **Color Palette**: Neutral tones with `text-amber-900` accents for wedding aesthetic (see [Footer.tsx](app/components/Footer.tsx))
- **Layout**: Responsive flexbox containers, `min-h-screen` for full-height pages
- **Modals**: Use `fixed inset-0 z-50` with overlay patterns (`bg-black/60`) for proper layering
- **Tailwind Config**: Uses Tailwind CSS 4 with PostCSS, no custom colors needed

### State Management
- **Local state only**: `useState` for UI interactions (modals, menu toggles, form data, image errors)
- **URL state**: Hash fragments for navigation state (home page sections) and page routes
- **Image error tracking**: Use Set data structure to track failed image loads (gallery uses `Set<number>`)
- **Modal state machines**: Use string union types for multi-step modals (e.g., `'initial' | 'attending' | 'not-attending'`)
- **No external stores** (Redux, Zustand, Context): Keep patterns simple and local

### Form Handling
- Forms use `handleSubmit(e: React.FormEvent)` with `e.preventDefault()`
- Form data accumulated in single `useState` object (see RSVP modal pattern)
- Redirect on success via `useRouter().push()` from `next/navigation`
- Copy-to-clipboard operations use `navigator.clipboard` with `document.execCommand` fallback

## External Integration Points

- **Image Optimization**: Use Next.js `<Image>` component (already used in RSVP modal)
- **Font Loading**: Google Fonts via `next/font/google` with CSS variables
- **Routing**: Next.js App Router only—no pages/ directory
- **No API routes**: This is a frontend-only wedding site (no backend services detected)

## Common Patterns & Interactions

### Image Error Handling
- All images wrapped in conditional render checking error state boolean
- Falls back to UI div with helpful text displaying expected filename and location
- Example: `onError={() => setImageError(true)}` paired with `{imageError ? <Fallback /> : <Image />}`

### Wish List Implementation  
- [wish-list/page.tsx](app/wish-list/page.tsx) displays 13 gift items from `wishListItems` array
- Each item has `id`, `name`, and `price` properties
- Copy-to-clipboard modal for account transfers uses browser clipboard API with execCommand fallback
- Items can be fetched from external API if needed (currently hardcoded)

## Common Pitfalls

1. **SSR/Hydration Mismatch**: Always defer browser APIs (`window`, `location`) until after `useEffect` mount (see Navigation)
   - Example: Read `window.location.hash` only inside `useEffect`, never in component body
2. **Hash Navigation**: Remember to distinguish `isRoute: true` pages from anchor sections in nav links
   - Routes use normal link navigation; sections trigger smooth scroll on home page, `window.location.href` redirect on other pages
3. **Mobile Menu**: Ensure mobile menu closes when navigating away
   - Call `setIsMobileMenuOpen(false)` inside `handleNavClick()` to prevent menu staying open after navigation
4. **Image Errors**: Always handle image load errors gracefully (RSVP modal has fallback)
   - Every `<Image>` component needs `onError` callback and conditional render for fallback UI
5. **Form State**: Form data state resets must happen in `useEffect` dependency on modal/dialog state
   - See RSVP modal's `useEffect(() => { if (!isOpen) { resetForm() } }, [isOpen])`

## Future Enhancement Areas
- Consider `/api/*` routes if needing backend (mailing, RSVP persistence)
- Optimize [page.tsx](app/page.tsx) (501 lines) by extracting RSVP modal to separate component
- Add dynamic sections (e.g., countdown timer, timeline of events)
