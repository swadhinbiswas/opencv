import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { SeoJsonLd } from "@/components/seo/json-ld";
import { BRAND } from "@/lib/brand";
import { FONTS_CDN_URL } from "@/lib/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE = BRAND.domain;
const KEYWORDS = [
  "cv builder",
  "free cv builder",
  "cv maker",
  "resume builder",
  "free resume builder",
  "online resume maker",
  "cv templates",
  "resume templates",
  "free cv templates",
  "cover letter builder",
  "cover letter templates",
  "best cv builder",
  "best resume builder",
  "ats resume",
  "ats friendly resume",
  "professional cv maker",
  "cv format",
  "resume format",
  "curriculum vitae builder",
  "create cv online",
  "make a resume",
  "cv pdf download",
  "resume maker free",
  "executive resume template",
  "simple cv template",
  "academic cv template",
  "creative resume template",
  "two column resume",
  "modern cv design",
].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `OpenCV — Free CV Builder, Resume Maker & Cover Letter Templates`,
    template: `%s · OpenCV CV Builder`,
  },
  description:
    "OpenCV is the free, fast CV builder trusted by job seekers. Create a professional resume or curriculum vitae from 12+ ATS-friendly templates, pair it with a matching cover letter, and download a polished PDF in minutes. No sign-up fuss, no design skills needed.",
  applicationName: "OpenCV",
  authors: [{ name: "OpenCV" }],
  category: "career",
  keywords: KEYWORDS,
  creator: "OpenCV",
  publisher: "OpenCV",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE,
    siteName: "OpenCV",
    title: "OpenCV — Free CV Builder, Resume Maker & Cover Letter Templates",
    description:
      "Build a professional, ATS-friendly CV and matching cover letter in minutes with OpenCV's free online builder. 12+ templates, instant PDF download.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "OpenCV — Free CV Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenCV — Free CV Builder & Cover Letter Maker",
    description:
      "Create a professional CV, resume or cover letter free. ATS-friendly templates, matching cover letters and one-click PDF download.",
    images: ["/opengraph-image"],
  },
  verification: {
    // Add your Google/Bing search-console tokens here when you own the domain.
    // google: "google-verification-token",
    // yandex: "yandex-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_CDN_URL} />
        <SeoJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
