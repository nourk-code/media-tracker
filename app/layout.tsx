import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediaVault — Your Personal Media Tracker",
  description:
    "Track your movies and TV shows, get AI-powered recommendations, and share your collection.",
  openGraph: {
    title: "MediaVault",
    description: "Your personal media collection tracker",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} antialiased bg-[#0a0a0f] text-white`}>
        <QueryProvider>
          {children}
          <Toaster richColors theme="dark" />
        </QueryProvider>
      </body>
    </html>
  );
}
