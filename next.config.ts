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
      { source: '/info/yacht-charters', destination: '/info/activities#water', permanent: true },
      // Concierge services don't have their own pages — send old links to the
      // service's card on the concierge page.
      { source: '/services/concierge/:slug', destination: '/services/concierge#:slug', permanent: true },
    ]
  },
  // Configure transpilation for Sanity modules
  transpilePackages: ['sanity', '@sanity/ui', '@sanity/icons'],
};

export default nextConfig;
