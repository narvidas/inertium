/**
 * SEO Pages Data File
 *
 * This file defines all programmatic SEO pages.
 * Copy to: /src/app/data/seo-pages.ts
 *
 * CUSTOMISATION:
 * 1. Replace event types with your audience segments
 * 2. Replace features with your product features
 * 3. Add your keywords from keyword matrix
 * 4. Update platform and USP options
 */

export interface SEOPage {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  eventType: string; // Your audience/use case categories
  primaryFeature: string; // Your feature categories
  platform?: string; // app | website | platform | software | tool
  usp?: string; // Unique selling point for this keyword
  score: number; // Priority score (9.5 = highest)
}

/**
 * EVENT TYPES - Replace with your audience segments
 *
 * Examples:
 * - SaaS: "startup" | "enterprise" | "agency" | "freelancer"
 * - E-commerce: "fashion" | "electronics" | "beauty" | "home"
 * - Services: "wedding" | "corporate" | "family" | "conference"
 */
type EventType =
  | "wedding"
  | "corporate"
  | "team building"
  | "company event"
  | "conference";

/**
 * FEATURES - Replace with your product features
 *
 * Examples:
 * - SaaS: "analytics" | "automation" | "reporting" | "integration"
 * - E-commerce: "search" | "checkout" | "inventory" | "shipping"
 * - Services: "photo sharing" | "slideshow" | "guestbook" | "challenges"
 */
type Feature =
  | "photo challenges"
  | "slideshow"
  | "digital guestbook"
  | "video greetings"
  | "photo sharing"
  | "video sharing"
  | "photo collection";

/**
 * PLATFORMS - Common platform terms
 */
type Platform = "app" | "website" | "platform" | "software" | "tool";

/**
 * USPs - Your unique selling points
 *
 * Replace with your differentiators:
 * - "no code" | "AI-powered" | "real-time" | "free" | "enterprise"
 */
type USP =
  | "qr code"
  | "no app"
  | "instant"
  | "real-time"
  | "interactive"
  | "custom"
  | "live"
  | "big screen";

export const seoPages: SEOPage[] = [
  // ============================================
  // TIER 1: Scores 9.0+ (Build First)
  // ============================================

  {
    slug: "wedding-photo-challenges-platform",
    keyword: "wedding photo challenges platform",
    title: "Wedding Photo Challenges Platform | YourBrand",
    description:
      "Interactive photo challenges for wedding guests. No app downloads required. QR code access, real-time displays, and instant photo collection.",
    eventType: "wedding",
    primaryFeature: "photo challenges",
    platform: "platform",
    score: 9.5,
  },
  {
    slug: "wedding-slideshow-platform",
    keyword: "wedding slideshow platform",
    title: "Wedding Slideshow Platform | Live Photo Display | YourBrand",
    description:
      "Live wedding slideshow on big screens. Guests upload photos via QR code. Photos appear in real-time during your reception.",
    eventType: "wedding",
    primaryFeature: "slideshow",
    platform: "platform",
    score: 9.4,
  },
  {
    slug: "corporate-event-slideshow-platform",
    keyword: "corporate event slideshow platform",
    title: "Corporate Event Slideshow Platform | YourBrand",
    description:
      "Live photo slideshows for corporate events. QR code uploads, big screen display, team engagement through photo challenges.",
    eventType: "corporate",
    primaryFeature: "slideshow",
    platform: "platform",
    score: 9.4,
  },

  // Add more Tier 1 keywords here (scores 9.0+)
  // ...

  // ============================================
  // TIER 2: Scores 8.5-8.9 (Build Second)
  // ============================================

  {
    slug: "qr-code-slideshow-corporate-event",
    keyword: "qr code slideshow corporate event",
    title: "QR Code Corporate Event Slideshow | Live Display | YourBrand",
    description:
      "QR code slideshow for corporate events. Instant photo uploads, live display on screens, team engagement.",
    eventType: "corporate",
    primaryFeature: "slideshow",
    usp: "qr code",
    score: 8.9,
  },

  // Add more Tier 2 keywords here (scores 8.5-8.9)
  // ...

  // ============================================
  // TIER 3: Scores 8.0-8.4 (Expansion)
  // ============================================

  // Add Tier 3 keywords here (scores 8.0-8.4)
  // ...
];

/**
 * Helper function to get pages by event type
 */
export function getPagesByEventType(eventType: string): SEOPage[] {
  return seoPages
    .filter((page) => page.eventType === eventType)
    .sort((a, b) => b.score - a.score);
}

/**
 * Helper function to get pages by feature
 */
export function getPagesByFeature(feature: string): SEOPage[] {
  return seoPages
    .filter((page) => page.primaryFeature === feature)
    .sort((a, b) => b.score - a.score);
}

/**
 * Helper function to get top pages (for homepage, etc.)
 */
export function getTopPages(limit: number = 12): SEOPage[] {
  return [...seoPages].sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Helper function to get pages grouped by event type
 */
export function getPagesByEventTypeGrouped(): Record<string, SEOPage[]> {
  return seoPages.reduce(
    (acc, page) => {
      if (!acc[page.eventType]) {
        acc[page.eventType] = [];
      }
      acc[page.eventType].push(page);
      acc[page.eventType].sort((a, b) => b.score - a.score);
      return acc;
    },
    {} as Record<string, SEOPage[]>
  );
}

