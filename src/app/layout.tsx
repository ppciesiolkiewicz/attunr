import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

// Production domain for OG/twitter - Messenger/Facebook require accessible image URLs.
// Vercel preview URLs can expire; always use production for link previews.
const SITE_URL = "https://www.attunr.app";
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL;
const base = new URL(baseUrl);
const ogImageUrl = `${SITE_URL}/web-app-manifest-512x512.png`;

export const metadata: Metadata = {
  metadataBase: base,
  title: {
    default: "attunr — align your voice",
    template: "%s — attunr",
  },
  description:
    "Find your frequency. Real-time chakra tone practice—sing into your mic and align your voice.",
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
    url: SITE_URL,
    siteName: "attunr",
    title: "attunr — align your voice",
    description:
      "Find your frequency. Real-time chakra tone practice—sing into your mic and align your voice.",
    images: [
      {
        url: ogImageUrl,
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
      "Find your frequency. Real-time chakra tone practice—sing into your mic and align your voice.",
    images: [ogImageUrl],
  },
};

const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {fbAppId && (
          <meta property="fb:app_id" content={fbAppId} />
        )}
      </head>
      <body className="h-full overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
