# OpenGraph Image Creation Guide

Your app is now configured to use an OpenGraph (OG) image for social media sharing. You need to create this image.

## Requirements

**File Location**: `/public/og-image.png`

**Dimensions**: 1200×630 pixels (1.91:1 aspect ratio)

**Format**: PNG or JPEG (PNG recommended for better quality)

**File Size**: Under 1MB (ideally 200-400KB)

## Design Guidelines

### Safe Zones
- **Central safe zone**: 1200×630px (always visible)
- **Mobile safe zone**: 600×315px center (what mobile users see)
- Keep important content in the center 50%

### Content Recommendations

1. **Logo/Branding**
   - Place your Feedbackbox logo prominently
   - Use high contrast against background

2. **Tagline/Value Proposition**
   - "Simple Feedback Widget for Developers"
   - "Collect User Feedback in One Line of Code"
   - Keep text large and readable (minimum 40px font size)

3. **Visual Element**
   - Show the feedback widget in action
   - Screenshot of the button or modal
   - Keep it simple and uncluttered

4. **Color Scheme**
   - Use your brand colors
   - Ensure good contrast (test in grayscale)
   - Consider both light and dark theme users

### Design Tools

**Free Options:**
- [Canva](https://www.canva.com/) - Templates available
- [Figma](https://www.figma.com/) - Professional design tool
- [GIMP](https://www.gimp.org/) - Open-source Photoshop alternative

**Quick Generators:**
- [OG Image Generator](https://og-image.vercel.app/)
- [Bannerbear](https://www.bannerbear.com/tools/open-graph-image-generator/)
- [Social Image Generator](https://www.socialimagesgenerator.com/)

## Example Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│    [Logo]           Feedbackbox             │
│                                             │
│     Simple Feedback Widget for Developers   │
│                                             │
│    [Widget Screenshot or Mockup]            │
│                                             │
│     ✓ One-line install                      │
│     ✓ Anonymous submissions                 │
│     ✓ Open source                           │
│                                             │
└─────────────────────────────────────────────┘
```

## Testing Your Image

After creating the image, test how it appears:

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Paste your site URL
   - Check how the image appears

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Paste your site URL
   - Preview the card

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Paste your site URL
   - Check the preview

4. **OpenGraph Checker**
   - URL: https://www.opengraph.xyz/
   - Test multiple social platforms at once

## Quick Templates

### Minimalist Template (Recommended)
```
Background: Gradient (your brand colors)
Logo: Top left
Main text: Center, 60-80px font
Subtitle: Below, 40-50px font
Accent: Small decorative element
```

### Screenshot Template
```
Background: Solid color
Screenshot: Right 50%
Text + logo: Left 50%
Features list: Bottom left
```

### Abstract Template
```
Background: Abstract shapes/patterns
Logo: Top center
Tagline: Center, very large
Minimal additional text
```

## Accessibility Considerations

- **High Contrast**: Text should be easily readable
- **No Text-Only**: Image should make sense without reading text
- **Clear Branding**: Logo should be recognizable
- **Avoid Clutter**: Less is more

## File Optimization

After creating your image:

1. **Compress the image**:
   - Use [TinyPNG](https://tinypng.com/)
   - Or [Squoosh](https://squoosh.app/)
   - Target: Under 500KB

2. **Test different formats**:
   - PNG for graphics with text
   - JPEG for photos
   - WebP for modern browsers (but keep PNG as fallback)

## Alternative: Dynamic OG Images

If you want to generate images dynamically (more advanced):

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ /* your styles */ }}>
        <h1>Feedbackbox</h1>
        <p>Simple Feedback Widget</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

Then update metadata to use: `images: [{ url: '/api/og' }]`

## Checklist

- [ ] Create 1200×630px image
- [ ] Include logo and branding
- [ ] Add compelling tagline
- [ ] Ensure text is readable at small sizes
- [ ] Test contrast in grayscale
- [ ] Optimize file size (under 500KB)
- [ ] Save as `/public/og-image.png`
- [ ] Test on Facebook Sharing Debugger
- [ ] Test on Twitter Card Validator
- [ ] Test on LinkedIn Post Inspector
- [ ] Verify on actual social media posts

## Current Status

⚠️ **Action Required**: The image `/public/og-image.png` needs to be created.

The metadata is already configured to use this image. Once you create it, social media sharing will automatically use it.
