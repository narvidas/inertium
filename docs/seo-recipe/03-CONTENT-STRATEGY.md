# Content Strategy: Templates and Variation

This document defines how to generate unique, high-quality content for each SEO page without writing each one manually.

---

## The Challenge

Programmatic SEO must balance:
- **Consistency** (same structure, same quality)
- **Uniqueness** (no duplicate content penalties)
- **Relevance** (specific to each keyword)
- **Scalability** (40-100+ pages)

The solution: **Template + Variation Systems**

---

## Page Structure (400-500 Words)

Each SEO page follows this structure:

| Section | Word Count | Purpose |
|---------|------------|---------|
| **Opening** | ~50 | Problem/context hook |
| **Problem Section** | ~80 | Pain points and current alternatives |
| **How It Works** | ~100 | Feature explanation |
| **Key Benefits** | ~120 | 3 benefits with H3 headings |
| **Use Case Example** | ~60 | Real-world scenario |
| **Why It Matters** | ~40 | Emotional/practical closure |
| **CTA** | ~20 | Direct action |
| **Total** | ~470 | Within range |

---

## Section Templates

### 1. Opening Templates (5+ Variations)

Create multiple opening patterns to ensure variety:

**Template 1: Problem-First**
```
Photos and videos from {context} often {pain_point}. 
Guests take hundreds of shots but rarely share them all. 
{Product} {feature} solves this through {USP}.
```

**Template 2: Solution-First**
```
Collecting content from {context} typically requires chasing {audience} afterwards. 
{Product} automates {feature} through browser-based {USP} access.
```

**Template 3: Context-First**
```
{Context (capitalised)} generate hundreds of photos across dozens of devices. 
{Product} brings {feature} together through simple {USP} scanning.
```

**Template 4: Traditional-vs-New**
```
Traditional {context} leave photos scattered across guest devices. 
{Product} {feature} centralises everything through {USP} access.
```

**Template 5: Disappearing-Memory**
```
Guest photos typically disappear after {context}. 
People forget to share or lose track of files. 
{Product} {feature} captures everything automatically.
```

### 2. Problem Section Templates (3+ Variations)

**Template 1: "The [Feature] Problem"**
```
Heading: The {Feature} Problem

{Context (capitalised)} produce massive amounts of content. 
Every {audience} takes photos and videos throughout the event.

Traditional collection methods fail consistently. 
Requesting photos weeks later yields poor results. 
People forget, lose interest, or simply never respond.
```

**Template 2: "Why Traditional Methods Fail"**
```
Heading: Why Traditional Methods Fail

Asking {audience} to email photos rarely works. 
Messages get buried, files exceed size limits, or people simply procrastinate.

Apps requiring downloads face resistance. 
Many {audience_alt} skip installation entirely, especially older guests who find new apps intimidating.
```

**Template 3: "The Challenge"**
```
Heading: The Challenge

Photos from {context} end up across dozens of devices. 
Each person holds fragments of the complete story.

Gathering everything requires manual effort. 
You message people individually, wait for responses, then organise mixed file formats and qualities.
```

### 3. How It Works Templates

Structure this around your feature. Create a base template per feature:

**Photo Challenges:**
```
Set up custom photo missions before your event.

Guests scan a QR code to view available challenges. 
Each mission includes specific instructions and point values.

Participants upload photos directly through their browser. 
No app installation required.

A live leaderboard displays on screens throughout the venue. 
Competition drives engagement naturally.
```

**Slideshow:**
```
Photos appear on screens throughout your event.

Guests upload photos via QR code throughout the event. 
Each photo processes and displays within seconds.

The slideshow runs continuously on any screen you connect. 
TVs, projectors, or monitors all work.

Photos rotate automatically with customisable timing. 
You control display duration and transition effects.
```

*Create one "How It Works" template for each feature.*

### 4. Benefits Templates

Create a pool of benefits per feature, then select 3 for each page:

**Photo Challenges Benefits Pool:**
| Focus | Title | Description |
|-------|-------|-------------|
| engagement | Keeps guests entertained | Challenges give people something to do between formal activities. They mingle more, take creative photos, and interact with other guests. |
| quality | Better photo variety | Specific challenges ensure you get diverse shots. Rather than random snaps, you receive photos covering different moments and perspectives. |
| memory | Creates shared stories | Guests remember competing in challenges long after the event. The leaderboard and winning photos become talking points. |

**Slideshow Benefits Pool:**
| Focus | Title | Description |
|-------|-------|-------------|
| atmosphere | Enhances venue atmosphere | Live photos create visual interest throughout the space. Guests see themselves and others on screen, generating excitement and conversation. |
| participation | Encourages photo taking | People upload more when they see photos displayed immediately. The instant feedback loop motivates continued participation. |
| memory | Captures the full event | Photos appear from start to finish. You document the entire experience, not just selected highlights. |

*Create 4-5 benefits per feature, rotate 3 per page.*

### 5. Use Case Templates (3+ Variations)

**Template 1: "For instance"**
```
For instance, place QR codes at {context_singular}. 
{Audience (capitalised)} scan throughout the event. 
By the end, you have complete {feature} coverage without asking anyone.
```

**Template 2: "Consider a typical"**
```
Consider a typical {context_singular}. 
Display QR codes prominently at entry and on tables. 
{Audience (capitalised)} upload content naturally. 
The {feature} builds automatically throughout the day.
```

**Template 3: "Take a recent"**
```
Take a recent {context_singular} as an example. 
QR codes appeared on invitations and signage. 
{Audience (capitalised)} knew exactly where to upload. 
The {feature} required zero follow-up.
```

### 6. Why It Matters Templates (3+ Variations)

**Template 1: Preservation**
```
{Context (capitalised)} deserve proper documentation. 
Every {audience} perspective matters. 
{Product} ensures nothing gets lost.
```

**Template 2: Fading Memory**
```
Memories from {context} fade quickly. 
Photos preserve moments you would otherwise forget. 
Automatic collection means more memories saved.
```

**Template 3: Outcome-Focused**
```
{Outcome (capitalised)} requires capturing authentic moments. 
{Product} makes comprehensive documentation effortless.
```

### 7. CTA Templates

Keep simple and direct:

```
Start using {Product} for {context}.
→ Button: {CTA_action}
```

**CTA Actions by Audience:**
- Wedding: "Try {Product} for your wedding"
- Corporate: "Start your corporate event"
- Team building: "Start your team building event"

---

## Variation System: Hash-Based Selection

To ensure consistent but varied content across pages:

```typescript
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Select template based on page slug
const hash = hashString(page.slug);
const openingTemplate = openingTemplates[hash % openingTemplates.length];
const problemTemplate = problemTemplates[hash % problemTemplates.length];
```

This ensures:
- Same page always gets same template (consistency)
- Different pages get different templates (variety)
- Deterministic selection (reproducible builds)

---

## Data Maps

### Audience Data Map

```typescript
const audienceData = {
  wedding: {
    audience: "guests",
    audienceAlt: "attendees",
    context: "weddings",
    contextSingular: "your wedding",
    verb: "celebrating",
    pain: "scattered across devices",
    outcome: "preserving memories",
    ctaAction: "Try {Product} for your wedding",
  },
  corporate: {
    audience: "attendees",
    audienceAlt: "participants",
    context: "corporate events",
    contextSingular: "your event",
    verb: "engaging teams",
    pain: "difficult to collect",
    outcome: "boosting engagement",
    ctaAction: "Start your corporate event",
  },
  // ... more audiences
};
```

### Feature Data Map

```typescript
const featureData = {
  "photo challenges": {
    shortName: "photo challenges",
    benefit: "Photo challenges turn passive guests into active participants.",
    howIntro: "Set up custom photo missions before your event.",
    howDetails: [
      "Guests scan a QR code to view available challenges...",
      "Participants upload photos directly through their browser...",
      "A live leaderboard displays on screens...",
    ],
    benefitList: [
      { focus: "engagement", title: "...", description: "..." },
      { focus: "quality", title: "...", description: "..." },
      { focus: "memory", title: "...", description: "..." },
    ],
    example: "Set five challenges at a wedding reception...",
  },
  // ... more features
};
```

---

## USP-Specific Additions

Add USP context when relevant:

```typescript
let uspAddition = "";
if (page.usp === "no app" || page.usp?.includes("no app")) {
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
```

---

## Content Generation Function

```typescript
export function generatePageContent(page: SEOPage): PageContent {
  const audienceInfo = audienceData[page.audience];
  const featureInfo = featureData[page.feature];
  
  const hash = hashString(page.slug);
  
  // Select templates
  const openingTemplate = openingTemplates[hash % openingTemplates.length];
  const problemTemplate = problemTemplates[hash % problemTemplates.length];
  const useCaseTemplate = useCaseTemplates[hash % useCaseTemplates.length];
  const whyItMattersTemplate = whyItMattersTemplates[hash % whyItMattersTemplates.length];
  
  // Shuffle benefits for this page
  const shuffledBenefits = [...featureInfo.benefitList]
    .sort((a, b) => hashString(page.slug + a.focus) - hashString(page.slug + b.focus))
    .slice(0, 3);
  
  // Build USP addition
  let uspAddition = "";
  // ... USP logic
  
  return {
    heading: capitalise(page.keyword),
    opening: openingTemplate(page.keyword, audienceInfo, featureInfo) + uspAddition,
    problemSection: problemTemplate(audienceInfo),
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
      content: useCaseTemplate(audienceInfo, featureInfo),
    },
    whyItMatters: whyItMattersTemplate(audienceInfo),
    cta: {
      text: `Start using {Product} for ${audienceInfo.context}.`,
      buttonText: audienceInfo.ctaAction,
    },
  };
}
```

---

## Content Quality Checklist

Before deployment, verify:

### Structure
- [ ] 400-500 words per page
- [ ] H1 uses exact keyword (capitalised)
- [ ] 3 benefit sections with unique H3 headings
- [ ] "For instance" or similar phrase in use case
- [ ] Clear CTA with specific action

### Writing Quality
- [ ] British English spelling (or your preference)
- [ ] No em dashes
- [ ] No AI-tell words
- [ ] Short paragraphs (1-3 sentences)
- [ ] Neutral, professional tone
- [ ] No exclamation marks (except CTAs if needed)

### Uniqueness
- [ ] No duplicate sentences across pages
- [ ] Template variation working
- [ ] Benefit rotation working
- [ ] Opening varies by page

### SEO
- [ ] Target keyword in H1
- [ ] Keyword variations in H2/H3
- [ ] Natural keyword integration
- [ ] No keyword stuffing

---

## Testing Content Quality

Generate 5-10 sample pages and verify:

1. **Read aloud** - Does it sound human?
2. **Compare pages** - Are they sufficiently different?
3. **Check keywords** - Is the target keyword naturally included?
4. **Word count** - Is each page 400-500 words?
5. **Tone consistency** - Does it match your brand?

---

## Visual Content Strategy

Each page should include:

### Images
- 2-3 relevant screenshots or photos
- Feature-specific (shows the feature in action)
- Audience-specific (shows context: wedding, corporate)
- Optimised with Next.js Image component

### Videos (Optional)
- Demo video for key pages
- Real usage footage if available
- Embedded with poster images

### Image Mapping

```typescript
const imageMapping = {
  wedding: {
    images: ["wedding.jpg", "table-qr.webp"],
    video: "/videos/live-example.mp4",
  },
  corporate: {
    images: ["corporate.jpg", "team-photo.jpg"],
    video: "/videos/explainer.mp4",
  },
};

const featureImageMapping = {
  "photo challenges": ["app-challenges.webp", "mobile-challenge.png"],
  "slideshow": ["app-slideshow.webp", "big-screen.jpg"],
  "digital guestbook": ["app-guestbook.webp", "qr-code.webp"],
};
```

---

## Internal Linking Strategy

Each page should link to:

1. **Hub page** (all use cases)
2. **Main category pages** (weddings, corporate, etc.)
3. **Homepage**
4. **About/Company page**
5. **Registration/CTA destination**

Consider also:
- Related use cases (same audience, different feature)
- Popular pages footer section
- Breadcrumb navigation

---

## Next Step

With your content strategy defined, proceed to `04-COPYWRITING-STYLE.md` for detailed writing guidelines.

