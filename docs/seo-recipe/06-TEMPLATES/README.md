# Code Templates

This folder contains ready-to-use code templates for implementing programmatic SEO in Next.js.

## Files

| File | Purpose | Copy To |
|------|---------|---------|
| `seo-pages.ts` | Keyword data definitions | `/src/app/data/seo-pages.ts` |
| `seo-content-generator.ts` | Content generation logic | `/src/lib/seo-content-generator.ts` |
| `SEOPageTemplate.tsx` | Page layout component | `/src/components/seo/SEOPageTemplate.tsx` |
| `page-dynamic.tsx` | Dynamic route handler | `/src/app/use-cases/[slug]/page.tsx` |
| `page-hub.tsx` | Hub/listing page | `/src/app/use-cases/page.tsx` |
| `layout.tsx` | Shared layout | `/src/app/use-cases/layout.tsx` |
| `sitemap.ts` | Sitemap generator | `/src/app/sitemap.ts` |

## Usage

1. Copy files to your Next.js project
2. Replace `YourBrand` with your brand name
3. Replace `yourdomain.com` with your domain
4. Customise event types and features to match your product
5. Add your keywords to `seo-pages.ts`
6. Update styling to match your design system

## Customisation Points

### seo-pages.ts
- Add your keywords from keyword matrix
- Update event types to match your audiences
- Update features to match your product

### seo-content-generator.ts
- Update `eventTypeData` with your audiences
- Update `featureData` with your features and benefits
- Modify templates to match your voice
- Replace `YourBrand` with your brand name

### SEOPageTemplate.tsx
- Update colours and styling
- Add/remove sections as needed
- Update CTA links
- Add images/videos if available

### page-dynamic.tsx
- Update domain in canonical URLs
- Update structured data schema type
- Update Open Graph images

### sitemap.ts
- Update base URL
- Add static pages
- Adjust priorities as needed

