# Keyword Matrix: Building Your Bottom-of-Funnel Keywords

This document guides you through creating a prioritised list of 40-100 keywords for programmatic SEO pages.

---

## The Approach

Bottom-of-funnel keywords follow predictable patterns. We exploit this by:

1. **Identifying pattern components** (audiences, features, platforms, USPs)
2. **Combining into keyword patterns** (systematic generation)
3. **Scoring for priority** (focus on high-intent first)
4. **Grouping into tiers** (phased implementation)

---

## Step 1: Define Your Components

Using your discovery answers, categorise your terms:

### Audience/Use Case Terms
> Who uses this? What events/contexts?

**Example (Camdeed):**
```
wedding, corporate event, company event, team building, conference, 
family reunion, birthday party, anniversary, christening, baby shower, 
gala, reception
```

**Your audience terms:**
```
[List your audience/use case terms]
```

### Feature Terms
> What does your product do?

**Example (Camdeed):**
```
photo sharing, video sharing, photo collection, digital guestbook, 
photo challenges, video greetings, slideshow, scavenger hunt, quiz
```

**Your feature terms:**
```
[List your feature terms]
```

### Platform/Solution Terms
> How do people describe this type of product?

**Example (Camdeed):**
```
app, website, platform, software, tool, solution
```

**Your platform terms:**
```
[List your platform/solution terms]
```

### USP/Qualifier Terms
> What makes you different? Descriptive qualifiers.

**Example (Camdeed):**
```
QR code, no app, no download, instant, real-time, interactive, 
AI-powered, automated, custom, big screen, live, multilingual
```

**Your USP terms:**
```
[List your USP/qualifier terms]
```

---

## Step 2: Keyword Pattern Templates

### Pattern A: [Audience] + [Feature] + [Platform]
> The most common bottom-of-funnel pattern

**Formula:** `{audience} {feature} {platform}`

**Examples:**
- wedding photo challenges platform
- corporate event slideshow app
- team building digital guestbook software

**Generate yours:**
```
{audience_1} {feature_1} {platform_1}
{audience_1} {feature_1} {platform_2}
{audience_1} {feature_2} {platform_1}
... (continue combinations)
```

### Pattern B: [USP/Qualifier] + [Feature] + [Audience]
> Differentiation-focused pattern

**Formula:** `{USP} {feature} {audience}`

**Examples:**
- QR code photo sharing wedding
- no app slideshow corporate event
- instant photo collection family reunion

**Generate yours:**
```
{USP_1} {feature_1} {audience_1}
{USP_1} {feature_1} {audience_2}
... (continue combinations)
```

### Pattern C: [Audience] + [Feature] + [USP]
> Alternative USP placement

**Formula:** `{audience} {feature} {USP}`

**Examples:**
- wedding photo QR code
- wedding photo no app
- corporate event slideshow live

### Pattern D: Competitor Alternatives
> Capture competitor searchers

**Formula:** `{competitor} alternative`

**Examples:**
- kululu alternative
- guestpix alternative
- [your competitor] alternative

### Pattern E: "Best" and "How-To" Queries
> High-intent informational queries

**Examples:**
- best wedding photo app
- how to collect photos from wedding guests
- best {audience} {feature} {platform}

---

## Step 3: Scoring Methodology

Score each keyword on four criteria:

### Scoring Formula
```
Score = (Intent × 0.35) + (Relevance × 0.30) + (Commercial × 0.20) + (Volume × 0.15)
```

### Criteria Definitions

| Criterion | Weight | What to Assess | Score 1-10 |
|-----------|--------|----------------|------------|
| **Intent** | 35% | How close to purchase? Platform-specific terms score higher. | 10 = "buy now", 1 = "what is" |
| **Relevance** | 30% | How well does your product solve this? Core features score higher. | 10 = perfect fit, 1 = tangential |
| **Commercial** | 20% | What's the revenue potential? Enterprise/wedding higher than hobby. | 10 = high value, 1 = low value |
| **Volume** | 15% | Estimated search volume (shorter = higher). | 10 = high volume, 1 = very niche |

### Example Scoring

| Keyword | Intent | Relevance | Commercial | Volume | **Score** |
|---------|--------|-----------|------------|--------|-----------|
| wedding photo challenges platform | 9 | 10 | 9 | 8 | **9.05** |
| wedding photo app | 7 | 8 | 9 | 10 | **8.15** |
| no app photo sharing wedding | 9 | 10 | 9 | 6 | **8.75** |
| how to share photos at wedding | 5 | 8 | 7 | 8 | **6.85** |

---

## Step 4: Generate Your Keyword List

### Process

1. **Combine all patterns** into a master list
2. **Remove duplicates** and near-duplicates
3. **Score each keyword** using the formula
4. **Sort by score** (highest first)
5. **Group into tiers**

### Tier Definitions

| Tier | Score Range | Priority | Pages |
|------|-------------|----------|-------|
| **Tier 1** | 9.0+ | Build first | ~20 pages |
| **Tier 2** | 8.5-8.9 | Build second | ~20 pages |
| **Tier 3** | 8.0-8.4 | Expansion | ~20 pages |
| **Tier 4** | 7.5-7.9 | Future | Optional |

---

## Step 5: Keyword Matrix Template

Use this format to document your keywords:

```typescript
interface SEOKeyword {
  keyword: string;          // "wedding photo challenges platform"
  slug: string;             // "wedding-photo-challenges-platform"
  title: string;            // "Wedding Photo Challenges Platform | {Brand}"
  description: string;      // Meta description (150-160 chars)
  audience: string;         // "wedding"
  feature: string;          // "photo challenges"
  platform?: string;        // "platform"
  usp?: string;             // "qr code"
  intentScore: number;      // 1-10
  relevanceScore: number;   // 1-10
  commercialScore: number;  // 1-10
  volumeScore: number;      // 1-10
  totalScore: number;       // Calculated
  tier: 1 | 2 | 3 | 4;      // Based on score
}
```

---

## Example: Top 20 Keywords (Camdeed)

### Tier 1 (Score 9.0+)

| Keyword | Audience | Feature | Score |
|---------|----------|---------|-------|
| wedding photo challenges platform | wedding | photo challenges | 9.5 |
| wedding slideshow platform | wedding | slideshow | 9.4 |
| corporate event slideshow platform | corporate | slideshow | 9.4 |
| wedding photo challenges app | wedding | photo challenges | 9.3 |
| corporate event digital guestbook platform | corporate | digital guestbook | 9.3 |
| corporate event photo challenges platform | corporate | photo challenges | 9.3 |
| corporate event video greetings platform | corporate | video greetings | 9.3 |
| wedding photo no app | wedding | photo sharing | 9.3 |
| wedding digital guestbook platform | wedding | digital guestbook | 9.2 |
| wedding video greetings platform | wedding | video greetings | 9.2 |

### Tier 2 (Score 8.7-8.9)

| Keyword | Audience | Feature | Score |
|---------|----------|---------|-------|
| qr code slideshow corporate event | corporate | slideshow | 8.9 |
| no app photo sharing corporate event | corporate | photo sharing | 8.9 |
| custom slideshow corporate event | corporate | slideshow | 8.9 |
| qr code slideshow wedding | wedding | slideshow | 8.8 |
| instant photo sharing wedding | wedding | photo sharing | 8.8 |
| real-time photo sharing wedding | wedding | photo sharing | 8.8 |
| interactive photo sharing wedding | wedding | photo sharing | 8.8 |
| team building slideshow platform | team building | slideshow | 8.8 |

---

## Keyword Generation Worksheet

### Step-by-Step

1. **List your components:**
   - Audiences: [a1, a2, a3, a4, a5]
   - Features: [f1, f2, f3, f4, f5]
   - Platforms: [p1, p2, p3]
   - USPs: [u1, u2, u3, u4]

2. **Generate Pattern A combinations:**
   - a1 + f1 + p1 = keyword 1
   - a1 + f1 + p2 = keyword 2
   - ... (5 × 5 × 3 = 75 combinations)

3. **Generate Pattern B combinations:**
   - u1 + f1 + a1 = keyword 76
   - ... (4 × 5 × 5 = 100 combinations)

4. **Add competitor alternatives:**
   - competitor1 alternative
   - competitor2 alternative

5. **Add "best" queries:**
   - best a1 f1 p1
   - best a1 f1

6. **Score and sort all keywords**

7. **Select top 40-100 for implementation**

---

## Validation Checklist

Before finalising your keyword list:

- [ ] Each keyword has clear purchase intent
- [ ] Your product genuinely solves the keyword's need
- [ ] Primary audiences (highest value) have more keywords
- [ ] Core features (strongest USPs) are well represented
- [ ] Mix of platform terms (app, platform, software, website)
- [ ] USP-driven keywords highlight differentiation
- [ ] Competitor alternatives included
- [ ] No duplicate or near-duplicate keywords
- [ ] All keywords can generate unique content

---

## Tracking Keywords

For ongoing SEO monitoring, track these keyword categories:

### Branded Keywords
```
{brand name}
{brand name} app
{brand name} {audience}
{brand name} pricing
{brand name} review
```

### Competitor Alternatives
```
{competitor1} alternative
{competitor2} alternative
{competitor1} vs {competitor2}
```

### Feature + Platform (High Intent)
```
{audience} {feature} platform
{audience} {feature} app
{audience} {feature} software
```

### USP-Driven (Differentiation)
```
{USP} {feature} {audience}
no {barrier} {feature} {audience}
```

---

## Output: Your Keyword Matrix

Create a spreadsheet or TypeScript file with columns:

| Column | Example |
|--------|---------|
| keyword | wedding photo challenges platform |
| slug | wedding-photo-challenges-platform |
| title | Wedding Photo Challenges Platform \| Brand |
| description | Interactive photo challenges for wedding guests... |
| audience | wedding |
| feature | photo challenges |
| platform | platform |
| usp | |
| score | 9.5 |
| tier | 1 |

---

## Next Step

With your keyword matrix complete, proceed to `03-CONTENT-STRATEGY.md` to design content templates.

