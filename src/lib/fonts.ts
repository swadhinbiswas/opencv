/**
 * Google Fonts CDN links for the font families referenced by CV templates.
 * The browser (or the headless Chrome used for PDF export) does the font
 * fetching; these are the real families so EB Garamond, Lato, Raleway, etc.
 * render exactly as designed instead of falling back to Liberation/Noto.
 */

export const FONTS_CDN_URL =
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400;1,700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Lato:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Ubuntu:ital,wght@0,400;0,500;0,700;1,400;1,700&display=swap";

export const FONTS_PRECONNECT = "https://fonts.googleapis.com";

export const FONTS_CDN_LINK =
  `<link rel="preconnect" href="https://fonts.googleapis.com" />` +
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />` +
  `<link rel="stylesheet" href="${FONTS_CDN_URL}" />`;
