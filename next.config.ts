import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity's CDN does the resizing; see lib/imageLoader.ts.
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Retired guides now covered elsewhere: bars live on the restaurants page,
  // yacht charters under "On the water" in the Activities guide.
  async redirects() {
    return [
      { source: '/info/nightlife', destination: '/casa-de-campo/nightlife', permanent: true },
      { source: '/info/beaches', destination: '/casa-de-campo/beaches', permanent: true },
      // The contact page lives on the About page now.
      { source: '/contact', destination: '/about#contact', permanent: true },
      { source: '/info/yacht-charters', destination: '/info/activities#water', permanent: true },
      // Concierge services don't have their own pages — send old links to the
      // service's card on the concierge page.
      { source: '/services/concierge/:slug', destination: '/services/concierge#:slug', permanent: true },
    ]
  },
  // Basic browser protections on every page. Framing is limited to our own
  // site (the Studio at /studio can still preview pages), so another site
  // can't load /admin or /portal invisibly and trick someone into clicking.
  // A full Content-Security-Policy is left for later: Sanity and Clerk load
  // scripts from their own domains and would need a careful allow-list.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
    ]
  },
  // Configure transpilation for Sanity modules
  transpilePackages: ['sanity', '@sanity/ui', '@sanity/icons'],
  // Renders the concierge PDF in a route handler; keep it out of the bundle.
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
