import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Leticia Coudray Real Estate",
  description: "Leticia Coudray Real Estate",
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