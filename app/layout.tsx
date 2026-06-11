import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import { SmoothCursor } from "@/registry/magicui/smooth-cursor";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.imagely.site"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Imagely - AI-Powered Image Processing",
    template: "%s | Imagely",
  },
  description: "Convert natural language descriptions into professional image processing tasks instantly. Resize, compress, remove backgrounds, and enhance photos using AI.",
  keywords: [
    "AI image editor",
    "natural language image processing",
    "remove background AI",
    "image converter",
    "AI crop and resize",
    "photo enhancer",
  ],
  authors: [{ name: "Imagely Team" }],
  creator: "Imagely",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.imagely.site",
    title: "Imagely - AI-Powered Image Processing",
    description: "Convert natural language descriptions into professional image processing tasks instantly.",
    siteName: "Imagely",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Imagely - AI Image Processing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imagely - AI-Powered Image Processing",
    description: "Convert natural language descriptions into professional image processing tasks instantly.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon-black.ico",
    apple: "/apple-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Imagely",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any",
  "description": "Convert natural language descriptions into professional image processing tasks instantly. Resize, compress, remove backgrounds, and enhance photos using AI.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="font-sans antialiased flex flex-col min-h-screen">
          <ErrorBoundary>
            <Navbar />
            {children}
            <Toaster position="bottom-right" />
            <Analytics />
            <SmoothCursor />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
