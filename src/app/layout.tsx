import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "attunr — Sing in tune",
  description: "Real-time chakra tone practice. Sing into your mic and find your frequency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
