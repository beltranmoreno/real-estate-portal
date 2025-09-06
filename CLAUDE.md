# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bilingual (ES/EN) real estate portal built with Next.js 15.5.2, Sanity CMS, and TailwindCSS. The platform supports property rentals and sales with advanced search, filtering, themed collections, and inquiry management.

## Development Commands

```bash
# Development
yarn dev        # Run development server with Turbopack on localhost:3000

# Production
yarn build      # Build for production with Turbopack
yarn start      # Start production server

# Sanity Studio
# Access at http://localhost:3000/studio
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.2 with App Router and Turbopack
- **CMS**: Sanity v4.6.1 (embedded studio at `/studio`)
- **Styling**: TailwindCSS v4 with PostCSS
- **Package Manager**: Yarn 1.22.22

### Route Structure
- `/` - Homepage with hero search, themed property rails, and area cards
- `/search` - Search results with filters and URL state persistence
- `/property/[slug]` - Property detail with gallery, calendar, and inquiry forms
- `/selection/[slug]` - Curated collection pages (e.g., wedding groups)
- `/studio` - Embedded Sanity Studio for content management

### Key Integrations
- **Sanity Configuration**: `sanity.config.ts` defines studio at `/studio` with Vision plugin for GROQ queries
- **Environment Variables**: Required in `.env.local`:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION` (defaults to '2025-09-06')

## Core Features Implementation

### Search & Filtering
URL state parameters to maintain:
- `checkIn`, `checkOut` - Date range
- `bedroomsMin` - Minimum bedrooms
- `area` - Location filter
- `themes` - Property themes (Family, Golf, Beachfront, Remote-work, Events)
- `golf`, `generator` - Amenity flags
- `guests` - Guest count

### Property Components
Essential components to implement:
- **SearchBar**: Date range picker with area and guest selectors
- **PropertyCard**: Display with badges for amenities (golf cart, generator)
- **AvailabilityCalendar**: Show blocked date ranges
- **QuoteWidget**: Calculate nightly rates with minimum nights validation
- **InquiryForm**: Contact form with WhatsApp integration

### API Endpoints (to implement)
```typescript
// Search properties
GET /api/search?checkIn=&checkOut=&area=&bedroomsMin=&golf=&generator=&themes=&guests=

// Get quote
POST /api/quote
Body: { propertyId, checkIn, checkOut, guests }

// Submit inquiry
POST /api/inquire
Body: { propertyId, propertyTitle, checkIn, checkOut, guests, name, email, phone?, message? }

// Get collection
GET /api/collection?slug=collectionSlug
```

### Internationalization
Implement ES/EN support throughout:
- Language switcher component
- All UI copy must be translatable
- Currency display: USD primary, DOP secondary
- Consider `next-intl` or `next-translate` for i18n

### Performance Requirements
- SSR/ISR for homepage, property pages, and themed rails
- Image optimization via Sanity CDN query parameters
- Code-split heavy components (calendar, map if implemented)
- Target Lighthouse scores ≥90 for Performance, Best Practices, SEO

### UX Rules
- Enforce minimum night requirements on quotes
- Prevent date overlap with blocked ranges
- Disable "Get Quote" button with clear reason when invalid
- Maintain filter state in URL for browser navigation
- Pre-fill WhatsApp messages with property details

### State Management
- Use SWR or React Query for data fetching and caching
- Maintain search filters in URL parameters
- Cache search results and quote calculations

## Sanity Schema Considerations

Property schema should include:
- Multilingual fields (title_es, title_en, description_es, description_en)
- `is_featured` boolean for homepage rails
- `themes` array for categorization
- `amenities` object with boolean flags (golf_cart, generator, etc.)
- `blocked_dates` for availability management
- `minimum_nights` for booking rules

## Development Notes

- The project uses Yarn as package manager (specified in package.json)
- Sanity Studio is embedded at `/studio` route - ensure proper access control
- TailwindCSS v4 is configured with PostCSS
- Next.js is configured with Turbopack for faster builds