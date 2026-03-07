import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "attunr",
  description: "Sing in tune with the sacred Solfeggio frequencies. Real-time pitch detection and chakra alignment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
