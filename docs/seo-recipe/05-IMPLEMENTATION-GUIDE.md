# Implementation Guide: Next.js Technical Setup

This guide covers the technical implementation of programmatic SEO pages in Next.js 14+ with App Router.

---

## Architecture Overview

```
/src
  /app
    /data
      seo-pages.ts              # Keyword data and page definitions
    /use-cases                   # (or /solutions, /features, etc.)
      /[slug]
        page.tsx                # Dynamic route for individual pages
      page.tsx                  # Hub/listing page
      layout.tsx                # Shared layout for SEO pages
    sitemap.ts                  # XML sitemap generator
  /components
    /seo
      SEOPageTemplate.tsx       # Page content template
  /lib
    seo-content-generator.ts    # Content generation logic
    image-map.ts                # Image imports (optional)
```

---

## Step 1: Create Data File

File: `/src/app/data/seo-pages.ts`

```typescript
export interface SEOPage {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  eventType: string;      // Your audience/use case categories
  primaryFeature: string; // Your feature categories
  platform?: string;      // app, website, platform, software, tool
  usp?: string;           // Unique selling point for this keyword
  score: number;          // Priority score (9.5 = highest)
}

export const seoPages: SEOPage[] = [
  // TIER 1: Scores 9.0+
  {
    slug: "wedding-photo-challenges-platform",
    keyword: "wedding photo challenges platform",
    title: "Wedding Photo Challenges Platform | YourBrand",
    description: "Interactive photo challenges for wedding guests. No app downloads required. QR code access, real-time displays.",
    eventType: "wedding",
    primaryFeature: "photo challenges",
    platform: "platform",
    score: 9.5,
  },
  {
    slug: "wedding-slideshow-platform",
    keyword: "wedding slideshow platform",
    title: "Wedding Slideshow Platform | Live Photo Display | YourBrand",
    description: "Live wedding slideshow on big screens. Guests upload photos via QR code. Photos appear in real-time.",
    eventType: "wedding",
    primaryFeature: "slideshow",
    platform: "platform",
    score: 9.4,
  },
  // ... add all your keywords
];
```

### Key Points:
- **slug:** URL-safe version of keyword (lowercase, hyphens)
- **keyword:** Exact search term you're targeting
- **title:** Page title with brand (keep under 60 characters)
- **description:** Meta description (150-160 characters)
- **score:** Used for sitemap priority and "Popular" badges

---

## Step 2: Create Content Generator

File: `/src/lib/seo-content-generator.ts`

```typescript
import { SEOPage } from "@/app/data/seo-pages";

interface Benefit {
  title: string;
  description: string;
}

interface PageContent {
  heading: string;
  opening: string;
  problemSection: {
    heading: string;
    content: string[];
  };
  howItWorks: {
    heading: string;
    content: string[];
  };
  benefits: {
    heading: string;
    items: Benefit[];
  };
  useCase: {
    heading: string;
    content: string;
  };
  whyItMatters: string;
  cta: {
    text: string;
    buttonText: string;
  };
}

// Data maps - customize these for your product
const eventTypeData: Record<string, {
  audience: string;
  audienceAlt: string;
  context: string;
  contextSingular: string;
  pain: string;
  outcome: string;
  ctaAction: string;
}> = {
  wedding: {
    audience: "guests",
    audienceAlt: "attendees",
    context: "weddings",
    contextSingular: "your wedding",
    pain: "scattered across devices",
    outcome: "preserving memories",
    ctaAction: "Try YourBrand for your wedding",
  },
  corporate: {
    audience: "attendees",
    audienceAlt: "participants",
    context: "corporate events",
    contextSingular: "your event",
    pain: "difficult to collect",
    outcome: "boosting engagement",
    ctaAction: "Start your corporate event",
  },
  // ... add more event types
};

const featureData: Record<string, {
  shortName: string;
  benefit: string;
  howIntro: string;
  howDetails: string[];
  benefitList: Array<{ focus: string; title: string; description: string }>;
  example: string;
}> = {
  "photo challenges": {
    shortName: "photo challenges",
    benefit: "Photo challenges turn passive guests into active participants.",
    howIntro: "Set up custom photo missions before your event.",
    howDetails: [
      "Guests scan a QR code to view available challenges. Each mission includes specific instructions and point values.",
      "Participants upload photos directly through their browser. No app installation required.",
      "A live leaderboard displays on screens throughout the venue. Competition drives engagement naturally.",
    ],
    benefitList: [
      {
        focus: "engagement",
        title: "Keeps guests entertained",
        description: "Challenges give people something to do between formal activities. They mingle more, take creative photos, and interact with other guests.",
      },
      {
        focus: "quality",
        title: "Better photo variety",
        description: "Specific challenges ensure you get diverse shots. Rather than random snaps, you receive photos covering different moments and perspectives.",
      },
      {
        focus: "memory",
        title: "Creates shared stories",
        description: "Guests remember competing in challenges long after the event. The leaderboard and winning photos become talking points.",
      },
    ],
    example: "Set five challenges at a wedding reception. Tasks include finding guests from different decades, capturing the best dance move, or photographing table decorations.",
  },
  // ... add more features
};

// Opening templates
const openingTemplates = [
  (keyword: string, eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `Photos and videos from ${eventData.context} often ${eventData.pain}. Guests take hundreds of shots but rarely share them all. YourBrand ${featureInfo.shortName} solves this through QR code access.`,

  (keyword: string, eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `Collecting content from ${eventData.context} typically requires chasing ${eventData.audience} afterwards. YourBrand automates ${featureInfo.shortName} through browser-based QR code access.`,

  (keyword: string, eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `${capitalise(eventData.context)} generate hundreds of photos across dozens of devices. YourBrand brings ${featureInfo.shortName} together through simple QR code scanning.`,

  (keyword: string, eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `Traditional ${eventData.context} leave photos scattered across guest devices. YourBrand ${featureInfo.shortName} centralises everything through QR code access.`,

  (keyword: string, eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `Guest photos typically disappear after ${eventData.context}. People forget to share or lose track of files. YourBrand ${featureInfo.shortName} captures everything automatically.`,
];

// Problem section templates
const problemTemplates = [
  (eventData: typeof eventTypeData[string]) => ({
    heading: "The Photo Collection Problem",
    content: [
      `${capitalise(eventData.context)} produce massive amounts of content. Every ${eventData.audience} takes photos and videos throughout the event.`,
      `Traditional collection methods fail consistently. Requesting photos weeks later yields poor results. People forget, lose interest, or simply never respond.`,
    ],
  }),

  (eventData: typeof eventTypeData[string]) => ({
    heading: "Why Traditional Methods Fail",
    content: [
      `Asking ${eventData.audience} to email photos rarely works. Messages get buried, files exceed size limits, or people simply procrastinate.`,
      `Apps requiring downloads face resistance. Many ${eventData.audienceAlt} skip installation entirely, especially older guests who find new apps intimidating.`,
    ],
  }),

  (eventData: typeof eventTypeData[string]) => ({
    heading: "The Challenge",
    content: [
      `Photos from ${eventData.context} end up across dozens of devices. Each person holds fragments of the complete story.`,
      `Gathering everything requires manual effort. You message people individually, wait for responses, then organise mixed file formats and qualities.`,
    ],
  }),
];

// Use case templates
const useCaseTemplates = [
  (eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `For instance, place QR codes at ${eventData.contextSingular}. ${capitalise(eventData.audience)} scan throughout the event. By the end, you have complete ${featureInfo.shortName} coverage without asking anyone.`,

  (eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `Consider a typical ${eventData.contextSingular}. Display QR codes prominently at entry and on tables. ${capitalise(eventData.audience)} upload content naturally. The ${featureInfo.shortName} builds automatically throughout the day.`,

  (eventData: typeof eventTypeData[string], featureInfo: typeof featureData[string]) =>
    `Take a recent ${eventData.contextSingular} as an example. QR codes appeared on invitations and signage. ${capitalise(eventData.audience)} knew exactly where to upload. The ${featureInfo.shortName} required zero follow-up.`,
];

// Why it matters templates
const whyItMattersTemplates = [
  (eventData: typeof eventTypeData[string]) =>
    `${capitalise(eventData.context)} deserve proper documentation. Every ${eventData.audience} perspective matters. YourBrand ensures nothing gets lost.`,

  (eventData: typeof eventTypeData[string]) =>
    `Memories from ${eventData.context} fade quickly. Photos preserve moments you would otherwise forget. Automatic collection means more memories saved.`,

  (eventData: typeof eventTypeData[string]) =>
    `${capitalise(eventData.outcome)} requires capturing authentic moments. YourBrand makes comprehensive documentation effortless.`,
];

// Utility functions
function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Main content generation function
export function generatePageContent(page: SEOPage): PageContent {
  const eventData = eventTypeData[page.eventType];
  const featureInfo = featureData[page.primaryFeature];

  // Use slug as seed for consistent but varied template selection
  const hash = hashString(page.slug);
  const openingTemplate = openingTemplates[hash % openingTemplates.length];
  const problemTemplate = problemTemplates[hash % problemTemplates.length];
  const useCaseTemplate = useCaseTemplates[hash % useCaseTemplates.length];
  const whyItMattersTemplate = whyItMattersTemplates[hash % whyItMattersTemplates.length];

  // Select benefits based on hash to ensure variety
  const shuffledBenefits = [...featureInfo.benefitList]
    .sort((a, b) => {
      const hashA = hashString(page.slug + a.focus);
      const hashB = hashString(page.slug + b.focus);
      return hashA - hashB;
    })
    .slice(0, 3);

  // Add USP-specific content if applicable
  let uspAddition = "";
  if (page.usp?.includes("no app")) {
    uspAddition = " Guests access everything through their web browser.";
  } else if (page.usp === "qr code") {
    uspAddition = " One QR code handles all access.";
  } else if (page.usp === "instant" || page.usp === "real-time") {
    uspAddition = " Content appears within seconds of upload.";
  } else if (page.usp === "interactive") {
    uspAddition = " Gamification keeps guests engaged throughout.";
  } else if (page.usp === "custom") {
    uspAddition = " Full customisation matches your branding.";
  }

  return {
    heading: page.keyword
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    opening: openingTemplate(page.keyword, eventData, featureInfo) + uspAddition,
    problemSection: problemTemplate(eventData),
    howItWorks: {
      heading: "How It Works",
      content: [featureInfo.howIntro, ...featureInfo.howDetails],
    },
    benefits: {
      heading: "Key Benefits",
      items: shuffledBenefits,
    },
    useCase: {
      heading: "Real-World Use",
      content: useCaseTemplate(eventData, featureInfo),
    },
    whyItMatters: whyItMattersTemplate(eventData),
    cta: {
      text: `Start using YourBrand for ${eventData.context}.`,
      buttonText: eventData.ctaAction,
    },
  };
}
```

---

## Step 3: Create Page Template Component

File: `/src/components/seo/SEOPageTemplate.tsx`

```typescript
import { SEOPage } from '@/app/data/seo-pages';
import { generatePageContent } from '@/lib/seo-content-generator';
import Link from 'next/link';

export default function SEOPageTemplate({ page }: { page: SEOPage }) {
  const content = generatePageContent(page);

  return (
    <main className="flex-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {content.heading}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-700">
              {content.opening}
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
              {content.problemSection.heading}
            </h2>
            {content.problemSection.content.map((paragraph, idx) => (
              <p key={idx} className="mt-4 text-lg leading-8 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
              {content.howItWorks.heading}
            </h2>
            {content.howItWorks.content.map((paragraph, idx) => (
              <p key={idx} className="mt-4 text-lg leading-8 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-12">
              {content.benefits.heading}
            </h2>
            <div className="space-y-10">
              {content.benefits.items.map((benefit, idx) => (
                <div key={idx}>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-lg leading-8 text-gray-700">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Example */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
              {content.useCase.heading}
            </h2>
            <p className="text-lg leading-8 text-gray-700">
              {content.useCase.content}
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-xl leading-9 text-gray-700 italic border-l-4 border-blue-500 pl-6">
              {content.whyItMatters}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xl text-white mb-8">
              {content.cta.text}
            </p>
            <Link
              href="/register" // Update to your registration URL
              className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50"
            >
              {content.cta.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              More Information
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                Home
              </Link>
              <Link href="/use-cases" className="text-blue-600 hover:text-blue-800 underline">
                All Use Cases
              </Link>
              {/* Add more relevant links */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## Step 4: Create Dynamic Route Handler

File: `/src/app/use-cases/[slug]/page.tsx`

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seoPages } from '@/app/data/seo-pages';
import SEOPageTemplate from '@/components/seo/SEOPageTemplate';

// Generate static params for all SEO pages
export async function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

// Generate metadata for each page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = seoPages.find((p) => p.slug === params.slug);

  if (!page) {
    return {};
  }

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
      type: 'website',
      siteName: 'YourBrand',
      images: [
        {
          url: 'https://yourdomain.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'YourBrand',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: ['https://yourdomain.com/og-image.png'],
    },
  };
}

export default function SEOPage({ params }: { params: { slug: string } }) {
  const page = seoPages.find((p) => p.slug === params.slug);

  if (!page) {
    notFound();
  }

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication", // Adjust type as needed
    "name": "YourBrand",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "description": page.description,
    "offers": {
      "@type": "Offer",
      "price": "49.90", // Your pricing
      "priceCurrency": "EUR"
    },
    "url": `https://yourdomain.com/use-cases/${page.slug}`,
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
```

---

## Step 5: Create Hub/Listing Page

File: `/src/app/use-cases/page.tsx`

```typescript
import { Metadata } from "next";
import Link from "next/link";
import { seoPages } from "@/app/data/seo-pages";

export const metadata: Metadata = {
  title: "Use Cases | Solutions | YourBrand",
  description: "Explore YourBrand solutions for various use cases. Find the perfect solution for your needs.",
  alternates: {
    canonical: "https://yourdomain.com/use-cases",
  },
};

export default function UseCasesPage() {
  // Group pages by event type
  const pagesByEventType = seoPages.reduce((acc, page) => {
    if (!acc[page.eventType]) {
      acc[page.eventType] = [];
    }
    acc[page.eventType].push(page);
    return acc;
  }, {} as Record<string, typeof seoPages>);

  // Sort by score within each group
  Object.keys(pagesByEventType).forEach((eventType) => {
    pagesByEventType[eventType].sort((a, b) => b.score - a.score);
  });

  return (
    <main className="flex-auto">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Use Cases & Solutions
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Find the perfect solution for your needs.
          </p>
        </div>
      </section>

      {/* Use Cases by Category */}
      {Object.entries(pagesByEventType).map(([eventType, pages]) => (
        <section key={eventType} className="py-16 odd:bg-white even:bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 capitalize">
              {eventType} Solutions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/use-cases/${page.slug}`}
                  className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 capitalize">
                      {page.keyword}
                    </h3>
                    {page.score >= 9.0 && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex-1">{page.description}</p>
                  {page.platform && (
                    <span className="mt-4 inline-flex self-start rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                      {page.platform}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
```

---

## Step 6: Create Layout

File: `/src/app/use-cases/layout.tsx`

```typescript
import { Header } from "@/components/Header"; // Your header component
import { Footer } from "@/components/Footer"; // Your footer component

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
```

---

## Step 7: Update Sitemap

File: `/src/app/sitemap.ts`

```typescript
import { MetadataRoute } from "next";
import { seoPages } from "./data/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yourdomain.com";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/use-cases`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    // Add other static pages
  ];

  // SEO pages with priority based on score
  const seoPageEntries = seoPages.map((page) => ({
    url: `${baseUrl}/use-cases/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page.score >= 9.0 ? 0.85 : 0.75,
  }));

  return [...staticPages, ...seoPageEntries];
}
```

---

## Step 8: Build and Test

### Local Development

```bash
npm run dev
# Visit http://localhost:3000/use-cases
# Visit http://localhost:3000/use-cases/wedding-photo-challenges-platform
```

### Build for Production

```bash
npm run build
# Check for any build errors
# Verify static pages generated
```

### Verify Output

After building, check:
1. All pages in sitemap.xml
2. Each page has unique content
3. Meta tags correct per page
4. Structured data valid (test with Google Rich Results Test)
5. Internal links working

---

## Optional: Add Images

### Create Image Map

File: `/src/lib/image-map.ts`

```typescript
import { StaticImageData } from "next/image";
import wedding from "@/images/screenshots/wedding.jpg";
import corporate from "@/images/screenshots/corporate.jpg";
// ... import more images

export const imageMap: Record<string, StaticImageData> = {
  wedding,
  corporate,
  // ... more mappings
};

export type ImageKey = keyof typeof imageMap;
```

### Add Images to Content Generator

```typescript
// In seo-content-generator.ts
const mediaMapping = {
  wedding: {
    images: ["wedding", "table-qr"],
    video: "/videos/demo.mp4",
  },
  corporate: {
    images: ["corporate", "team-photo"],
  },
};
```

### Update Template to Display Images

```typescript
// In SEOPageTemplate.tsx
{content.media?.images && (
  <section className="py-16 bg-white">
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {content.media.images.map((img, idx) => (
        <Image
          key={idx}
          src={imageMap[img]}
          alt={`${content.heading} example ${idx + 1}`}
          className="rounded-2xl"
        />
      ))}
    </div>
  </section>
)}
```

---

## Deployment Checklist

- [ ] All SEO pages build successfully
- [ ] Sitemap includes all pages
- [ ] Meta tags unique per page
- [ ] Structured data valid
- [ ] Images optimised
- [ ] Internal links working
- [ ] Mobile responsive
- [ ] Page speed acceptable (<3s)

### Post-Deployment

1. Submit sitemap to Google Search Console
2. Submit sitemap to Bing Webmaster Tools
3. Monitor indexing progress
4. Track keyword rankings
5. Monitor traffic to SEO pages

---

## Next Step

See `06-TEMPLATES/` for ready-to-use code files you can copy into your project.

