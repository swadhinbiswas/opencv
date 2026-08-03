/**
 * Central brand constants. Keeps the site name, tagline and SEO copy in one
 * place so branding stays consistent across the landing page, app shell,
 * metadata, structured data and auth screens.
 */
export const BRAND = {
  name: "OpenCV",
  mark: "OC",
  tagline: "Free CV Builder & Cover Letter Maker",
  domain: process.env.NEXT_PUBLIC_APP_URL ?? "https://opencv.build",
  /** Primary accent used across branded surfaces. */
  accent: "#2563eb",
} as const;

export const APP_NAME = BRAND.name;
