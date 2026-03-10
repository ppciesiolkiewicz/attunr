import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "attunr — align your voice",
    template: "%s — attunr",
  },
  description:
    "Real-time chakra tone practice. Sing into your mic and find your frequency. Explore chakra tones, vocal warmups, and breathwork.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en",
    siteName: "attunr",
    title: "attunr — align your voice",
    description:
      "Real-time chakra tone practice. Sing into your mic and find your frequency. Explore chakra tones, vocal warmups, and breathwork.",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "attunr — align your voice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "attunr — align your voice",
    description:
      "Real-time chakra tone practice. Sing into your mic and find your frequency.",
    images: ["/web-app-manifest-512x512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
