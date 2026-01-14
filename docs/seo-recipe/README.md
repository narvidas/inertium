# Programmatic SEO Recipe for Next.js

> A battle-tested approach to creating bottom-of-funnel SEO landing pages at scale using Next.js, TypeScript, and intelligent content generation.

## What This Recipe Achieves

This recipe guides you through creating **40-100+ programmatic SEO pages** targeting high-intent, bottom-of-funnel keywords. Each page:

- Targets a specific long-tail keyword
- Contains 400-500 words of unique, high-quality content
- Follows SEO best practices (metadata, structured data, internal linking)
- Loads instantly via static generation
- Sounds human, not AI-generated

## Who This Is For

- **Product teams** wanting to capture search traffic for specific use cases
- **Startups** looking to build organic traffic without large content teams
- **SaaS companies** targeting feature + use case combinations
- **Service businesses** creating location or service variant pages

## Recipe Structure

| File | Purpose |
|------|---------|
| `01-DISCOVERY.md` | Starting questions to gather project context |
| `02-KEYWORD-MATRIX.md` | Building and prioritising your keyword list |
| `03-CONTENT-STRATEGY.md` | Content templates and variation strategies |
| `04-COPYWRITING-STYLE.md` | Writing guidelines for professional, human copy |
| `05-IMPLEMENTATION-GUIDE.md` | Technical Next.js implementation |
| `06-TEMPLATES/` | Ready-to-customise code files |

## How to Use This Recipe

### Step 1: Discovery (30-60 minutes)
Work through `01-DISCOVERY.md` to establish:
- Your product/service definition
- Target audiences and use cases
- Core features and USPs
- Competitive positioning

### Step 2: Keyword Matrix (1-2 hours)
Follow `02-KEYWORD-MATRIX.md` to:
- Generate keyword patterns
- Score and prioritise keywords
- Create your 40-100 keyword list

### Step 3: Content Strategy (1-2 hours)
Use `03-CONTENT-STRATEGY.md` to:
- Define content templates
- Create variation systems
- Establish tone and structure

### Step 4: Implementation (2-4 hours)
Follow `05-IMPLEMENTATION-GUIDE.md` to:
- Set up Next.js routes
- Implement content generator
- Create page templates
- Configure sitemap and metadata

### Step 5: Generate and Review (1-2 hours)
- Generate all pages
- Review samples for quality
- Iterate on templates as needed
- Deploy and submit to search engines

## Expected Results

Based on the reference implementation:

| Metric | Value |
|--------|-------|
| Pages generated | 41 |
| Words per page | 400-500 |
| Build time overhead | ~10 seconds |
| Unique content | 100% (no duplicate sentences) |
| Time to implement | 4-8 hours |

## Technical Requirements

- **Next.js 14+** with App Router
- **TypeScript** (recommended)
- **Tailwind CSS** (recommended)
- Static export capability

## Key Principles

1. **Quality over quantity** - 40 excellent pages beat 200 mediocre ones
2. **Bottom of funnel focus** - Target people ready to buy/sign up
3. **Human-sounding copy** - Avoid AI tells and marketing fluff
4. **Template + variation** - Consistency with uniqueness
5. **Static generation** - Fast pages, easy deployment

## What Makes This Different

Unlike typical SEO advice, this recipe provides:

- **Actual code templates** you can drop into your project
- **Scoring methodology** for keyword prioritisation
- **Content variation system** to avoid duplicate content penalties
- **Real implementation** that's been deployed and tested

## Quick Start

1. Copy `06-TEMPLATES/` into your Next.js project
2. Answer questions in `01-DISCOVERY.md`
3. Generate your keyword matrix using `02-KEYWORD-MATRIX.md`
4. Customise templates with your product data
5. Build and deploy

---

## Reference Implementation

This recipe was developed from a production implementation for Camdeed (event photo sharing platform). The reference project achieved:

- 41 programmatic SEO pages
- Targeting wedding, corporate, and team building keywords
- Unique content with template variations
- Full SEO optimisation (metadata, structured data, sitemap)
- Beautiful, responsive page templates

---

## Files to Create/Modify

After following this recipe, your project will have:

```
/src
  /app
    /data
      seo-pages.ts              # Keyword definitions
    /use-cases (or /solutions)
      /[slug]
        page.tsx                # Dynamic route
      page.tsx                  # Hub/listing page
      layout.tsx                # Shared layout
    sitemap.ts                  # Updated sitemap
  /components
    /seo
      SEOPageTemplate.tsx       # Page template
  /lib
    seo-content-generator.ts    # Content generation
```

---

*Recipe version: 1.0*  
*Last updated: December 2025*

