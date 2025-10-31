import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caribbean Estates - Luxury Properties in Dominican Republic",
  description: "Find your perfect Caribbean home. Exclusive properties for rent and sale in the best locations of Dominican Republic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LocaleProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
