/**
 * SEO Content Generator
 *
 * Generates unique, high-quality content for each SEO page.
 * Copy to: /src/lib/seo-content-generator.ts
 *
 * CUSTOMISATION:
 * 1. Update eventTypeData with your audience segments
 * 2. Update featureData with your product features
 * 3. Modify templates to match your brand voice
 * 4. Replace "YourBrand" with your brand name
 */

import { SEOPage } from "@/app/data/seo-pages";

// ============================================
// INTERFACES
// ============================================

interface Benefit {
  title: string;
  description: string;
}

export interface PageContent {
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

// ============================================
// DATA MAPS - CUSTOMISE THESE
// ============================================

/**
 * EVENT TYPE DATA
 *
 * Define data for each audience/use case segment.
 * Replace with your own segments.
 */
const eventTypeData: Record<
  string,
  {
    audience: string;
    audienceAlt: string;
    context: string;
    contextSingular: string;
    pain: string;
    outcome: string;
    ctaAction: string;
  }
> = {
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
  "team building": {
    audience: "team members",
    audienceAlt: "colleagues",
    context: "team building events",
    contextSingular: "your team event",
    pain: "lost after the event",
    outcome: "strengthening team bonds",
    ctaAction: "Start your team building event",
  },
  "company event": {
    audience: "employees",
    audienceAlt: "staff members",
    context: "company events",
    contextSingular: "your company event",
    pain: "never shared properly",
    outcome: "building company culture",
    ctaAction: "Start your company event",
  },
  conference: {
    audience: "attendees",
    audienceAlt: "delegates",
    context: "conferences",
    contextSingular: "your conference",
    pain: "hard to access afterwards",
    outcome: "capturing key moments",
    ctaAction: "Start your conference",
  },
};

/**
 * FEATURE DATA
 *
 * Define data for each product feature.
 * Replace with your own features.
 */
const featureData: Record<
  string,
  {
    shortName: string;
    benefit: string;
    howIntro: string;
    howDetails: string[];
    benefitList: Array<{ focus: string; title: string; description: string }>;
    example: string;
  }
> = {
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
        description:
          "Challenges give people something to do between formal activities. They mingle more, take creative photos, and interact with other guests.",
      },
      {
        focus: "quality",
        title: "Better photo variety",
        description:
          "Specific challenges ensure you get diverse shots. Rather than random snaps, you receive photos covering different moments and perspectives.",
      },
      {
        focus: "memory",
        title: "Creates shared stories",
        description:
          "Guests remember competing in challenges long after the event. The leaderboard and winning photos become talking points.",
      },
    ],
    example:
      "Set five challenges at a wedding reception. Tasks include finding guests from different decades, capturing the best dance move, or photographing table decorations. Winners receive recognition on the big screen.",
  },
  slideshow: {
    shortName: "slideshow",
    benefit: "Live slideshows display guest photos as they happen.",
    howIntro: "Photos appear on screens throughout your event.",
    howDetails: [
      "Guests upload photos via QR code throughout the event. Each photo processes and displays within seconds.",
      "The slideshow runs continuously on any screen you connect. TVs, projectors, or monitors all work.",
      "Photos rotate automatically with customisable timing. You control display duration and transition effects.",
    ],
    benefitList: [
      {
        focus: "atmosphere",
        title: "Enhances venue atmosphere",
        description:
          "Live photos create visual interest throughout the space. Guests see themselves and others on screen, generating excitement and conversation.",
      },
      {
        focus: "participation",
        title: "Encourages photo taking",
        description:
          "People upload more when they see photos displayed immediately. The instant feedback loop motivates continued participation.",
      },
      {
        focus: "memory",
        title: "Captures the full event",
        description:
          "Photos appear from start to finish. You document the entire experience, not just selected highlights.",
      },
    ],
    example:
      "Mount a large screen at the venue entrance. As guests arrive and upload photos, images cycle through continuously. Late arrivals see earlier moments they missed.",
  },
  "digital guestbook": {
    shortName: "digital guestbook",
    benefit:
      "Digital guestbooks collect photos, videos, and messages in one place.",
    howIntro: "Guests contribute content through a simple QR code.",
    howDetails: [
      "Place QR codes at tables, on cards, or displayed on screens. Guests scan to access the guestbook instantly.",
      "People upload photos, record video messages, or write text. All formats accepted without technical barriers.",
      "Everything compiles automatically after your event. You receive a complete digital album within hours.",
    ],
    benefitList: [
      {
        focus: "completeness",
        title: "Captures every perspective",
        description:
          "Traditional guestbooks get text only. Digital versions include visual and audio content, creating richer memories.",
      },
      {
        focus: "convenience",
        title: "No physical book to manage",
        description:
          "Nothing to carry, store, or worry about damaging. All content lives digitally and backs up automatically.",
      },
      {
        focus: "sharing",
        title: "Easy to share afterwards",
        description:
          "Send the digital guestbook to anyone instantly. Family and friends access content without physical handoffs.",
      },
    ],
    example:
      "Print QR codes on table cards at a reception. Throughout the evening, guests leave video messages and upload favourite photos. The next day, you receive a compiled album with all contributions.",
  },
  "video greetings": {
    shortName: "video greetings",
    benefit: "Video greetings capture authentic messages from attendees.",
    howIntro: "Recording video messages requires just a QR code scan.",
    howDetails: [
      "Guests scan the code and grant camera access. The browser handles recording without additional software.",
      "Record messages of any length. People say what they want without strict time limits.",
      "Videos save automatically to your collection. After the event, clips compile into a shareable compilation.",
    ],
    benefitList: [
      {
        focus: "authenticity",
        title: "Preserves genuine reactions",
        description:
          "Video captures tone, emotion, and personality that text misses. You get real moments, not polished performances.",
      },
      {
        focus: "flexibility",
        title: "Record anywhere at the venue",
        description:
          "No dedicated booth required. Guests record from their seats, outside, or wherever they feel comfortable.",
      },
      {
        focus: "keepsake",
        title: "Creates lasting memories",
        description:
          "Years later, you can hear voices and see faces. The emotional value exceeds static photos.",
      },
    ],
    example:
      "Set up a video greeting station at a corporate event. Employees record short messages for a retiring colleague. After the event, compile clips into a farewell video.",
  },
  "photo sharing": {
    shortName: "photo sharing",
    benefit: "Photo sharing collects all guest images automatically.",
    howIntro: "QR codes make photo collection effortless.",
    howDetails: [
      "Guests scan a code to reach the upload page. They select photos from their device and upload instantly.",
      "All photos gather in a shared album automatically. No manual organisation or collection required.",
      "Everyone with the link can view and download photos. Access persists long after the event ends.",
    ],
    benefitList: [
      {
        focus: "convenience",
        title: "Eliminates chase-up",
        description:
          "No need to message guests asking for photos. Everyone uploads during or right after the event.",
      },
      {
        focus: "completeness",
        title: "Captures every angle",
        description:
          "Different guests photograph different moments. The collective album covers far more than any single photographer.",
      },
      {
        focus: "access",
        title: "Instant availability",
        description:
          "Photos appear in real-time as guests upload. No waiting weeks for a photographer to deliver.",
      },
    ],
    example:
      "Place QR codes on each table at a family gathering. Relatives upload photos throughout the day. By evening, hundreds of photos from different perspectives fill the shared album.",
  },
  "video sharing": {
    shortName: "video sharing",
    benefit: "Video sharing collects clips from multiple perspectives.",
    howIntro: "Guests upload video content alongside photos.",
    howDetails: [
      "The same QR code accepts both photos and videos. Guests select their media type during upload.",
      "Videos process and store automatically. Large files upload reliably through optimised compression.",
      "All clips gather in a shared gallery. You can view, download, or share any video afterwards.",
    ],
    benefitList: [
      {
        focus: "richness",
        title: "Adds motion and sound",
        description:
          "Video captures moments that photos cannot. Dancing, speeches, and reactions all come alive.",
      },
      {
        focus: "perspective",
        title: "Multiple viewpoints",
        description:
          "Different guests film different moments. The collection shows the event from every angle.",
      },
      {
        focus: "simplicity",
        title: "No technical barriers",
        description:
          "Uploading works like sharing photos. Guests need no special knowledge or apps.",
      },
    ],
    example:
      "Share the QR code during ceremony speeches. Guests capture reactions and moments from their seats. Later, you watch the event from perspectives you never saw live.",
  },
  "photo collection": {
    shortName: "photo collection",
    benefit: "Photo collection gathers images without manual effort.",
    howIntro: "Automated systems handle all photo gathering.",
    howDetails: [
      "Distribute QR codes before and during your event. Guests scan whenever they take photos.",
      "Photos upload directly to your album. No sorting through messages or email attachments.",
      "The album grows throughout the event. You can watch the collection build in real-time.",
    ],
    benefitList: [
      {
        focus: "effort",
        title: "Removes manual work",
        description:
          "No requesting, downloading, or organising files. Everything flows to one place automatically.",
      },
      {
        focus: "timing",
        title: "Captures the moment",
        description:
          "Guests upload while memories are fresh. Photos appear with context still clear.",
      },
      {
        focus: "completeness",
        title: "Nothing gets lost",
        description:
          "Photos never sit forgotten on phones. The immediate upload process ensures maximum collection.",
      },
    ],
    example:
      "Send the QR code to all attendees before a birthday party. As people take photos, they upload immediately. By the time the party ends, you have a complete album without asking anyone.",
  },
};

// ============================================
// TEMPLATE VARIATIONS
// ============================================

type EventData = (typeof eventTypeData)[keyof typeof eventTypeData];
type FeatureInfo = (typeof featureData)[keyof typeof featureData];

/**
 * Opening paragraph templates (5 variations)
 */
const openingTemplates: Array<
  (keyword: string, eventData: EventData, featureInfo: FeatureInfo) => string
> = [
  (keyword, eventData, featureInfo) =>
    `Photos and videos from ${eventData.context} often ${eventData.pain}. Guests take hundreds of shots but rarely share them all. YourBrand ${featureInfo.shortName} solves this through QR code access.`,

  (keyword, eventData, featureInfo) =>
    `Collecting content from ${eventData.context} typically requires chasing ${eventData.audience} afterwards. YourBrand automates ${featureInfo.shortName} through browser-based QR code access.`,

  (keyword, eventData, featureInfo) =>
    `${capitalise(eventData.context)} generate hundreds of photos across dozens of devices. YourBrand brings ${featureInfo.shortName} together through simple QR code scanning.`,

  (keyword, eventData, featureInfo) =>
    `Traditional ${eventData.context} leave photos scattered across guest devices. YourBrand ${featureInfo.shortName} centralises everything through QR code access.`,

  (keyword, eventData, featureInfo) =>
    `Guest photos typically disappear after ${eventData.context}. People forget to share or lose track of files. YourBrand ${featureInfo.shortName} captures everything automatically.`,
];

/**
 * Problem section templates (3 variations)
 */
const problemTemplates: Array<
  (eventData: EventData) => { heading: string; content: string[] }
> = [
  (eventData) => ({
    heading: "The Photo Collection Problem",
    content: [
      `${capitalise(eventData.context)} produce massive amounts of content. Every ${eventData.audience} takes photos and videos throughout the event.`,
      `Traditional collection methods fail consistently. Requesting photos weeks later yields poor results. People forget, lose interest, or simply never respond.`,
    ],
  }),

  (eventData) => ({
    heading: "Why Traditional Methods Fail",
    content: [
      `Asking ${eventData.audience} to email photos rarely works. Messages get buried, files exceed size limits, or people simply procrastinate.`,
      `Apps requiring downloads face resistance. Many ${eventData.audienceAlt} skip installation entirely, especially older guests who find new apps intimidating.`,
    ],
  }),

  (eventData) => ({
    heading: "The Challenge",
    content: [
      `Photos from ${eventData.context} end up across dozens of devices. Each person holds fragments of the complete story.`,
      `Gathering everything requires manual effort. You message people individually, wait for responses, then organise mixed file formats and qualities.`,
    ],
  }),
];

/**
 * Use case templates (3 variations)
 */
const useCaseTemplates: Array<
  (eventData: EventData, featureInfo: FeatureInfo) => string
> = [
  (eventData, featureInfo) =>
    `For instance, place QR codes at ${eventData.contextSingular}. ${capitalise(eventData.audience)} scan throughout the event. By the end, you have complete ${featureInfo.shortName} coverage without asking anyone.`,

  (eventData, featureInfo) =>
    `Consider a typical ${eventData.contextSingular}. Display QR codes prominently at entry and on tables. ${capitalise(eventData.audience)} upload content naturally. The ${featureInfo.shortName} builds automatically throughout the day.`,

  (eventData, featureInfo) =>
    `Take a recent ${eventData.contextSingular} as an example. QR codes appeared on invitations and signage. ${capitalise(eventData.audience)} knew exactly where to upload. The ${featureInfo.shortName} required zero follow-up.`,
];

/**
 * Why it matters templates (3 variations)
 */
const whyItMattersTemplates: Array<(eventData: EventData) => string> = [
  (eventData) =>
    `${capitalise(eventData.context)} deserve proper documentation. Every ${eventData.audience} perspective matters. YourBrand ensures nothing gets lost.`,

  (eventData) =>
    `Memories from ${eventData.context} fade quickly. Photos preserve moments you would otherwise forget. Automatic collection means more memories saved.`,

  (eventData) =>
    `${capitalise(eventData.outcome)} requires capturing authentic moments. YourBrand makes comprehensive documentation effortless.`,
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Hash function for consistent template selection
 * Same input always produces same output
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ============================================
// MAIN CONTENT GENERATION FUNCTION
// ============================================

export function generatePageContent(page: SEOPage): PageContent {
  const eventData = eventTypeData[page.eventType];
  const featureInfo = featureData[page.primaryFeature];

  // Fallback for missing data
  if (!eventData || !featureInfo) {
    console.warn(`Missing data for page: ${page.slug}`);
    return getDefaultContent(page);
  }

  // Use slug as seed for consistent but varied template selection
  const hash = hashString(page.slug);
  const openingTemplate = openingTemplates[hash % openingTemplates.length];
  const problemTemplate = problemTemplates[hash % problemTemplates.length];
  const useCaseTemplate = useCaseTemplates[hash % useCaseTemplates.length];
  const whyItMattersTemplate =
    whyItMattersTemplates[hash % whyItMattersTemplates.length];

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
    opening:
      openingTemplate(page.keyword, eventData, featureInfo) + uspAddition,
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

/**
 * Fallback content for missing data
 */
function getDefaultContent(page: SEOPage): PageContent {
  const keyword = page.keyword
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    heading: keyword,
    opening: `${keyword} helps you achieve better results. YourBrand provides the tools you need.`,
    problemSection: {
      heading: "The Problem",
      content: [
        "Traditional approaches are inefficient and time-consuming.",
        "Modern solutions provide better alternatives.",
      ],
    },
    howItWorks: {
      heading: "How It Works",
      content: [
        "Getting started is simple.",
        "Our platform guides you through each step.",
        "Results appear quickly.",
      ],
    },
    benefits: {
      heading: "Key Benefits",
      items: [
        {
          title: "Save Time",
          description: "Automated processes handle the heavy lifting.",
        },
        {
          title: "Better Results",
          description:
            "Optimised workflows deliver improved outcomes.",
        },
        {
          title: "Easy to Use",
          description:
            "Intuitive interface requires no technical expertise.",
        },
      ],
    },
    useCase: {
      heading: "Real-World Use",
      content:
        "For instance, teams use this approach daily to streamline their workflows and achieve better results.",
    },
    whyItMatters:
      "Modern challenges require modern solutions. YourBrand provides the tools you need to succeed.",
    cta: {
      text: "Start using YourBrand today.",
      buttonText: "Get Started",
    },
  };
}

