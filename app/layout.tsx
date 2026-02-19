import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueryMind — Natural Language SQL",
  description: "Query any database in plain English. Powered by Gemini 2.5 Flash.",
  metadataBase: new URL("https://querymind.app"),
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
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
