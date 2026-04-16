import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/contexts/LocaleContext";
import "./globals.css";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Resolution order:
//   1. NEXT_PUBLIC_SITE_URL  — set this in Vercel (Production scope) to your real
//      canonical domain. This is what we use for all SEO tags in production.
//   2. VERCEL_URL            — auto-set by Vercel on every deployment (preview
//      + prod). Useful as a fallback so preview deployments don't crash, but
//      they get noindexed below.
//   3. hardcoded fallback    — for local dev and worst case.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://leticiacoudrayrealestate.com";
const SITE_NAME = "Leticia Coudray Real Estate";
const DEFAULT_TITLE = "Luxury Properties in Casa de Campo | Leticia Coudray Real Estate";
const DEFAULT_DESCRIPTION =
  "Find your perfect Caribbean home. Exclusive properties for rent and sale in Casa de Campo, Dominican Republic — villas, condos, and penthouses curated by Leticia Coudray.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Leticia Coudray", url: SITE_URL }],
  creator: "Leticia Coudray",
  publisher: SITE_NAME,
  keywords: [
    "Casa de Campo",
    "Dominican Republic real estate",
    "Caribbean villas",
    "luxury vacation rentals",
    "Punta Cana real estate",
    "Casa de Campo villas",
    "Casa de Campo rental",
    "villas Dominican Republic",
    "Leticia Coudray",
    "Casa de Campo for sale",
    "La Romana real estate",
  ],
  category: "real estate",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/?lang=en",
      "es-DO": "/?lang=es",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: ["es_DO"],
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  // Preview/development deployments should never be indexed — only
  // the production deployment gets the full indexable robots rules.
  robots:
    process.env.VERCEL_ENV === "production"
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  verification: {
    // Paste verification tokens here once you add Search Console / Bing.
    // google: "xxxxxxxxxxxxx",
    // other: { "msvalidate.01": "xxxxxxxxxxxxx" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD structured data for the business itself. Renders on every
// page so Google can associate the site with the business entity.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": `${SITE_URL}#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/Logo_LCS_Real_Estate.png`,
  image: DEFAULT_OG_IMAGE,
  description: DEFAULT_DESCRIPTION,
  areaServed: [
    { "@type": "Place", name: "Casa de Campo, La Romana, Dominican Republic" },
    { "@type": "Place", name: "La Romana, Dominican Republic" },
    { "@type": "Country", name: "Dominican Republic" },
  ],
  knowsLanguage: ["en", "es"],
  founder: {
    "@type": "Person",
    name: "Leticia Coudray",
  },
  sameAs: [
    // Fill these in when available:
    // "https://www.instagram.com/leticiacoudray",
    // "https://www.facebook.com/leticiacoudray",
    // "https://www.linkedin.com/in/leticiacoudray",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  inLanguage: ["en", "es"],
  publisher: { "@id": `${SITE_URL}#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?area={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // Next.js de-duplicates script tags inserted this way and
          // renders them in <head> on both server and client.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
