/**
 * SEO Page Template Component
 *
 * Renders the content for each SEO page.
 * Copy to: /src/components/seo/SEOPageTemplate.tsx
 *
 * CUSTOMISATION:
 * 1. Update colours and styling to match your brand
 * 2. Update CTA link to your registration/conversion URL
 * 3. Add/remove sections as needed
 * 4. Add images/videos if available
 */

import { SEOPage } from "@/app/data/seo-pages";
import { generatePageContent } from "@/lib/seo-content-generator";
import Link from "next/link";

interface SEOPageTemplateProps {
  page: SEOPage;
}

export default function SEOPageTemplate({ page }: SEOPageTemplateProps) {
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

      {/* 
        OPTIONAL: Visual Gallery Section
        Uncomment and customise if you have images
        
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              See It in Action
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Real examples of how YourBrand works
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Add Image components here */}
          </div>
        </div>
      </section>
      */}

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
            <p className="text-xl text-white mb-8">{content.cta.text}</p>
            <Link
              href="/register" // UPDATE: Change to your registration/conversion URL
              className="inline-block rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
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
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Home
              </Link>
              <Link
                href="/use-cases"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                All Use Cases
              </Link>
              {/* UPDATE: Add more relevant links for your site */}
              <Link
                href="/about"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

