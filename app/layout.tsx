import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Leticia Coudray Real Estate - Luxury Properties in Casa de Campo",
  description: "Find your perfect Caribbean home. Exclusive properties for rent and sale in the best locations of Casa de Campo, Dominican Republic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
