/**
 * Dynamic Route Handler for SEO Pages
 *
 * Handles individual SEO page rendering with metadata and structured data.
 * Copy to: /src/app/use-cases/[slug]/page.tsx
 *
 * CUSTOMISATION:
 * 1. Update domain in canonical URLs
 * 2. Update Open Graph images
 * 3. Update structured data schema type and details
 * 4. Update brand name
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { seoPages } from "@/app/data/seo-pages";
import SEOPageTemplate from "@/components/seo/SEOPageTemplate";

// Generate static params for all SEO pages at build time
export async function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

// Generate metadata for each page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = seoPages.find((p) => p.slug === params.slug);

  if (!page) {
    return {};
  }

  // UPDATE: Change to your domain
  const canonicalUrl = `https://yourdomain.com/use-cases/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      type: "website",
      siteName: "YourBrand", // UPDATE: Your brand name
      images: [
        {
          // UPDATE: Your Open Graph image
          url: "https://yourdomain.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "YourBrand",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      // UPDATE: Your Twitter card image
      images: ["https://yourdomain.com/og-image.png"],
    },
  };
}

export default function SEOPage({ params }: { params: { slug: string } }) {
  const page = seoPages.find((p) => p.slug === params.slug);

  if (!page) {
    notFound();
  }

  /**
   * Structured Data for Rich Snippets
   *
   * UPDATE: Change @type based on your product type:
   * - SoftwareApplication (for apps/software)
   * - Service (for services)
   * - Product (for physical/digital products)
   * - WebApplication (for web apps)
   *
   * See: https://schema.org/ for more types
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication", // UPDATE: Change type if needed
    name: "YourBrand", // UPDATE: Your brand name
    applicationCategory: "BusinessApplication", // UPDATE: Your category
    operatingSystem: "Web Browser",
    description: page.description,
    offers: {
      "@type": "Offer",
      price: "49.90", // UPDATE: Your pricing
      priceCurrency: "EUR", // UPDATE: Your currency
      availability: "https://schema.org/InStock",
    },
    featureList: [
      // UPDATE: Your feature list
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    url: `https://yourdomain.com/use-cases/${page.slug}`, // UPDATE: Your domain
    // Optional: Add aggregate rating if you have reviews
    // aggregateRating: {
    //   "@type": "AggregateRating",
    //   ratingValue: "4.8",
    //   ratingCount: "150",
    //   bestRating: "5",
    //   worstRating: "1"
    // }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SEOPageTemplate page={page} />
    </>
  );
}

