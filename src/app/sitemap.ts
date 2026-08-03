import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { TEMPLATE_SLUGS } from "@/lib/cv/seo-slugs";

/**
 * XML sitemap for search engines. Includes every public, indexable page so
 * crawlers discover the whole CV/resume content surface.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.domain;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/templates`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const templateRoutes: MetadataRoute.Sitemap = Object.keys(TEMPLATE_SLUGS).map((slug) => ({
    url: `${base}/templates/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...templateRoutes];
}
