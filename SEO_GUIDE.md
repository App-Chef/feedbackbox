# SEO & AEO Implementation Guide

This document outlines the SEO (Search Engine Optimization) and AEO (Answer Engine Optimization) implementation for Feedbackbox.

## Overview

The application now includes comprehensive SEO and AEO optimization to help potential users discover Feedbackbox when searching for feedback widget solutions.

## What Was Added

### 1. Enhanced Metadata (`app/layout.tsx`)

#### Basic SEO
- **Title**: Optimized with primary keywords ("Simple Feedback Widget for Developers")
- **Description**: Expanded to include key features and differentiators
- **Keywords**: 20+ targeted keywords covering:
  - Primary: "feedback widget", "user feedback tool", "customer feedback software"
  - Secondary: "open source feedback", "feedback for developers", "lightweight feedback widget"
  - Long-tail: "collect user feedback", "embed feedback widget", "anonymous feedback"

#### Social Media Optimization
- **OpenGraph tags**: For Facebook, LinkedIn, and general social sharing
- **Twitter Cards**: Optimized for Twitter sharing with large image cards
- **Social images**: References `/og-image.png` (you'll need to create this)

#### Search Engine Directives
- **Robots meta**: Configured to allow indexing with proper image/video/snippet previews
- **Canonical URLs**: Set to prevent duplicate content issues
- **Viewport**: Theme color configured for better mobile appearance

### 2. Structured Data (JSON-LD)

#### Root Layout Schema (`app/layout.tsx`)
**SoftwareApplication Schema**: Defines Feedbackbox as a developer tool with:
- Application category
- Feature list
- Pricing information (free)
- Aggregate ratings
- Author information

#### Landing Page Schemas (`app/(marketing)/page.tsx`)

**FAQPage Schema**: 8 common questions for AEO, including:
- "What is Feedbackbox?"
- "How do I install the feedback widget?"
- "Do users need to create an account?"
- "What information does Feedbackbox capture?"
- "Is Feedbackbox free to use?"
- "Can I customize the widget appearance?"
- "How is it different from UserVoice or Canny?"
- "What technologies does it use?"

**WebPage + Product Schema**: Enhances the landing page with:
- Product information
- Offers and pricing
- Aggregate ratings

**HowTo Schema**: Installation process broken into steps:
1. Sign up for Feedbackbox
2. Create a project
3. Add the script tag
4. Customize (optional)

### 3. Sitemap & Robots (`app/sitemap.ts` & `app/robots.ts`)

#### Sitemap
Includes all public pages with appropriate:
- **Change frequency**: How often content updates
- **Priority**: Relative importance (0.0 to 1.0)
- **Last modified**: Current date for all pages

Pages included:
- `/` (Home) - Priority 1.0, weekly updates
- `/demo` - Priority 0.8, monthly updates
- `/signup` - Priority 0.9, monthly updates
- `/login` - Priority 0.7, monthly updates

#### Robots.txt
- **Allows** all public pages
- **Disallows** private areas:
  - `/dashboard/` (user data)
  - `/api/` (endpoints)
  - `/auth/` (auth callbacks)
- **Sitemap reference**: Points to the XML sitemap

### 4. Page-Level Metadata

Enhanced metadata for key pages:
- **Demo page**: Encourages trying the widget
- **Login page**: Prevents indexing (robots: noindex)
- **Signup page**: Optimized for conversion

## Target Search Queries

The SEO implementation targets users searching for:

### Primary Queries
- "feedback widget for website"
- "simple feedback tool"
- "collect user feedback"
- "lightweight feedback widget"
- "feedback button for website"

### Problem-Based Queries
- "how to collect user feedback on website"
- "best feedback widget for developers"
- "free feedback tool"
- "anonymous feedback collection"

### Competitor Comparisons
- "UserVoice alternative"
- "Canny alternative"
- "Hotjar feedback alternative"
- "open source feedback widget"

### Technical Queries
- "Next.js feedback widget"
- "Supabase feedback system"
- "self-hosted feedback tool"

## Answer Engine Optimization (AEO)

AEO helps your app appear in:
- **ChatGPT**: When users ask "What's a good feedback widget?"
- **Google AI Overviews**: Featured snippets and AI summaries
- **Bing Chat**: Conversational search results
- **Perplexity AI**: Research-focused queries

### How It Works
The FAQ schema provides direct answers to common questions, making it easy for AI assistants to:
1. Understand what Feedbackbox does
2. Explain how it works
3. Compare it to alternatives
4. Recommend it when appropriate

## Next Steps

### 1. Create Social Media Image
Create an OpenGraph image at `/public/og-image.png`:
- **Size**: 1200×630px
- **Format**: PNG or JPEG
- **Content**: Show the widget in action with your logo and tagline
- **Text**: Keep it minimal and readable at small sizes

### 2. Set Up Analytics
Track SEO performance with:
- **Google Search Console**: Monitor search rankings and clicks
- **Google Analytics**: Track organic traffic and conversions
- **Plausible/Fathom**: Privacy-friendly alternative analytics

### 3. Build Backlinks
Increase authority by:
- Submitting to directories (Product Hunt, Indie Hackers)
- Writing blog posts about feedback collection
- Contributing to open-source showcases
- Engaging in developer communities

### 4. Content Marketing
Create helpful content:
- Blog posts about user feedback best practices
- Comparison guides vs. competitors
- Integration tutorials
- Case studies from users

### 5. Monitor & Iterate
Regularly check:
- **Search rankings**: Are you appearing for target keywords?
- **Click-through rates**: Are titles/descriptions compelling?
- **Bounce rates**: Is the landing page effective?
- **Conversions**: Are visitors signing up?

## Technical SEO Checklist

- [x] Meta titles and descriptions
- [x] OpenGraph and Twitter Card tags
- [x] Structured data (JSON-LD)
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Semantic HTML structure
- [x] Mobile-responsive design
- [x] Fast page loads
- [ ] HTTPS certificate (ensure in production)
- [ ] Social media preview image
- [ ] Google Search Console verification
- [ ] Analytics setup

## Structured Data Validation

Test your structured data:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/
3. **OpenGraph Debugger**: https://www.opengraph.xyz/

## Performance Recommendations

### Page Speed
- Optimize images (WebP format, lazy loading)
- Minimize JavaScript bundles
- Use Next.js Image component
- Enable caching headers

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Local SEO (If Applicable)

If targeting specific geographic markets:
- Add LocalBusiness schema
- Include location keywords
- Create location-specific landing pages

## Content Strategy

### Blog Topics (Future)
- "How to Collect Quality User Feedback"
- "Anonymous Feedback: Pros and Cons"
- "Building a Feedback Loop: Best Practices"
- "Feedback Widget vs. Traditional Support Desk"
- "Self-Hosting Your Feedback System"

### Landing Pages (Future)
- Use cases (SaaS, E-commerce, Blogs)
- Integrations (if you add them)
- Comparison pages (vs. competitors)

## Monitoring Keywords

Track these keywords monthly:
1. feedback widget
2. user feedback tool
3. open source feedback
4. feedback collection
5. anonymous feedback tool
6. lightweight feedback widget
7. feedback for developers
8. Next.js feedback widget
9. Supabase feedback
10. feedback widget alternative

## Common Issues & Solutions

### Issue: Not Ranking
- **Solution**: Build more backlinks, create content, improve page speed

### Issue: High Bounce Rate
- **Solution**: Improve landing page clarity, add social proof, optimize CTAs

### Issue: Low Click-Through Rate
- **Solution**: Rewrite meta descriptions, test different titles, add rich snippets

### Issue: Structured Data Errors
- **Solution**: Validate with Google's tools, fix JSON-LD syntax

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

## Updates Log

- **2024-10**: Initial SEO implementation
  - Enhanced metadata
  - Added structured data (FAQ, HowTo, Product, SoftwareApplication)
  - Created sitemap and robots.txt
  - Optimized page titles and descriptions
