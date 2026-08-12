import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Application Tracker",
    template: "%s | Application Tracker",
  },
  description:
    "Organize job applications, track hiring progress, schedule follow-ups, and keep your job search moving forward.",
  applicationName: "Application Tracker",
  keywords: [
    "job application tracker",
    "job search",
    "application management",
    "interview tracker",
    "follow-up tracker",
  ],
  openGraph: {
    title: "Application Tracker",
    description:
      "Organize job applications, track hiring progress, schedule follow-ups, and keep your job search moving forward.",
    type: "website",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}