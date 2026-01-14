/**
 * Sitemap Generator
 *
 * Generates XML sitemap including all SEO pages.
 * Copy to: /src/app/sitemap.ts
 *
 * CUSTOMISATION:
 * 1. Update baseUrl to your domain
 * 2. Add your static pages
 * 3. Adjust priorities as needed
 */

import { MetadataRoute } from "next";
import { seoPages } from "./data/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  // UPDATE: Change to your domain
  const baseUrl = "https://yourdomain.com";

  // Static pages - UPDATE: Add your own static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/use-cases`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // SEO pages with priority based on score
  const seoPageEntries: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${baseUrl}/use-cases/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    // Tier 1 pages (9.0+) get higher priority
    priority: page.score >= 9.0 ? 0.85 : page.score >= 8.5 ? 0.75 : 0.65,
  }));

  return [...staticPages, ...seoPageEntries];
}

