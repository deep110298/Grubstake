import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const DESCRIPTION =
  "Play Least Count against the computer: keep your hand low, call it, and win.";

export const metadata: Metadata = {
  metadataBase: new URL("https://leastcountapp.com"),
  title: "Least Count App",
  description: DESCRIPTION,
  openGraph: {
    title: "Least Count App",
    description: DESCRIPTION,
    url: "https://leastcountapp.com",
    siteName: "Least Count App",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Least Count App",
    description: DESCRIPTION,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
