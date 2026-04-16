import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Studio",
  description: "Content management",
  // Sanity Studio is admin-only — never index it.
  robots: { index: false, follow: false, nocache: true },
};

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  );
}