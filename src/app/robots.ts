import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/**
 * robots.txt — all content is indexable, and AI crawlers are explicitly
 * welcomed (the site IS a content/help surface for building CVs).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/profile", "/cv/", "/cover-letters/", "/jobs/", "/settings", "/print/"],
      },
      // AI / LLM crawlers get the whole public site.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended", "CCBot", "Applebot-Extended", "Bytespider", "cohere-ai"],
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BRAND.domain}/sitemap.xml`,
  };
}
