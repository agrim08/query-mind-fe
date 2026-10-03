import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted by next/font: no render-blocking request to Google, no layout shift.
// Each exposes a CSS variable that globals.css maps to --font-sans / --font-display / --font-mono.
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--qm-font-sans",
  display: "swap",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--qm-font-display",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--qm-font-mono",
  display: "swap",
});

// Share image (app/opengraph-image.tsx), apple-touch-icon (app/apple-icon.tsx) and the
// web manifest (app/manifest.ts) are picked up by Next's file conventions automatically.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Explicit `icons` replaces the file-convention list, so the apple icon must be listed here too.
  icons: {
    icon: "/favicon.svg",
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#080909",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#c8f04d",
          colorBackground: "#0f1011",
          colorText: "#f0f1f2",
          colorInputBackground: "#161819",
          colorInputText: "#f0f1f2",
          borderRadius: "8px",
          fontFamily: "var(--font-sans)",
        },
      }}
    >
      <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
