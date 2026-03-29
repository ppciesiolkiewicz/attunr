import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

// Production domain for OG/twitter - Messenger/Facebook require accessible image URLs.
// Vercel preview URLs can expire; always use production for link previews.
const SITE_URL = "https://www.attunr.app";
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL;
const base = new URL(baseUrl);
const ogImageUrl = `${SITE_URL}/web-app-manifest-512x512.png`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: base,
  title: {
    default: "attunr — your voice, your calm",
    template: "%s — attunr",
  },
  description:
    "Feel your voice in your body. A somatic practice that uses sound and breath to calm your nervous system.",
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
    title: "attunr — your voice, your calm",
    description:
      "Feel your voice in your body. A somatic practice that uses sound and breath to calm your nervous system.",
    images: [
      {
        url: ogImageUrl,
        width: 512,
        height: 512,
        alt: "attunr — your voice, your calm",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "attunr — your voice, your calm",
    description:
      "Feel your voice in your body. A somatic practice that uses sound and breath to calm your nervous system.",
    images: [ogImageUrl],
  },
};

const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${outfit.variable}`}>
      <head>
        {/* Native app: redirect root to /journey/ before anything renders */}
        <script dangerouslySetInnerHTML={{ __html:
          `if(location.pathname==="/"&&/^capacitor:|ionic:/i.test(location.protocol))location.replace("/journey/")`
        }} />
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
