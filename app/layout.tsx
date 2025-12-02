import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imagely",
  description: "Convert natural language to image processing specifications",
  icons: {
    icon: "/favicon-black.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased flex flex-col min-h-screen">
          <ErrorBoundary>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="bottom-right" />
            <Analytics />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
