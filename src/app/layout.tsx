import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentIndex — find a licensed football agent",
  description:
    "Find a licensed football agent and know who you're connecting with — cross-checked against the FA's public register.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-bg text-ink">{children}</body>
    </html>
  );
}
