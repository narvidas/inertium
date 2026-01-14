/**
 * Hub/Listing Page for All SEO Pages
 *
 * Displays all use cases grouped by category.
 * Copy to: /src/app/use-cases/page.tsx
 *
 * CUSTOMISATION:
 * 1. Update metadata and canonical URL
 * 2. Update eventTypeInfo with your categories and descriptions
 * 3. Update styling to match your brand
 * 4. Update CTA links
 */

import { Metadata } from "next";
import Link from "next/link";
import { seoPages } from "@/app/data/seo-pages";

// UPDATE: Change metadata for your site
export const metadata: Metadata = {
  title: "Use Cases | Solutions | YourBrand",
  description:
    "Explore YourBrand solutions for various use cases. Find the perfect solution for your needs.",
  alternates: {
    canonical: "https://yourdomain.com/use-cases", // UPDATE: Your domain
  },
};

export default function UseCasesPage() {
  // Group pages by event type
  const pagesByEventType = seoPages.reduce(
    (acc, page) => {
      if (!acc[page.eventType]) {
        acc[page.eventType] = [];
      }
      acc[page.eventType].push(page);
      return acc;
    },
    {} as Record<string, typeof seoPages>
  );

  // Sort by score within each group
  Object.keys(pagesByEventType).forEach((eventType) => {
    pagesByEventType[eventType].sort((a, b) => b.score - a.score);
  });

  /**
   * UPDATE: Category display information
   * Add your own categories with titles, descriptions, and icons
   */
  const eventTypeInfo: Record<
    string,
    { title: string; description: string; icon: string }
  > = {
    wedding: {
      title: "Wedding Solutions",
      description:
        "Photo sharing, digital guestbooks, and video greetings for your special day.",
      icon: "💍",
    },
    corporate: {
      title: "Corporate Events",
      description:
        "Professional photo solutions for conferences, team building, and company events.",
      icon: "🏢",
    },
    "team building": {
      title: "Team Building",
      description:
        "Interactive photo challenges and engagement tools for team activities.",
      icon: "🤝",
    },
    "company event": {
      title: "Company Events",
      description:
        "Photo sharing platforms for company gatherings and celebrations.",
      icon: "🎉",
    },
    conference: {
      title: "Conferences",
      description:
        "Professional event photo management for conferences and networking events.",
      icon: "🎤",
    },
  };

  return (
    <main className="flex-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Use Cases & Solutions
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              Discover how YourBrand helps across different types and scenarios.
              Find the perfect solution for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section (Optional) */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {seoPages.length}+
              </div>
              <div className="mt-1 text-sm text-gray-600">Solutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Object.keys(pagesByEventType).length}
              </div>
              <div className="mt-1 text-sm text-gray-600">Categories</div>
            </div>
            {/* UPDATE: Add your own stats */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Instant</div>
              <div className="mt-1 text-sm text-gray-600">Setup</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="mt-1 text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases by Event Type */}
      {Object.entries(pagesByEventType).map(([eventType, pages]) => {
        const info = eventTypeInfo[eventType] || {
          title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Solutions`,
          description: `Solutions for ${eventType} use cases.`,
          icon: "📋",
        };

        return (
          <section
            key={eventType}
            className="py-16 sm:py-20 odd:bg-white even:bg-slate-50"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{info.icon}</span>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {info.title}
                  </h2>
                </div>
                <p className="text-lg text-gray-600">{info.description}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/use-cases/${page.slug}`}
                    className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {page.keyword
                            .split(" ")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </h3>
                      </div>
                      {page.score >= 9.0 && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex-1">
                      {page.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {page.platform && (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {page.platform}
                        </span>
                      )}
                      {page.usp && (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {page.usp}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Find the perfect solution for your needs. No credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register" // UPDATE: Your registration URL
                className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/about" // UPDATE: Your about/learn more URL
                className="text-base font-semibold leading-7 text-white hover:text-blue-100"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

