---
title: Dark Mode Development Guide
inclusion: auto
---

# Dark Mode Development Guide

This project uses **dark mode as the default theme**. Users can toggle to light mode with a simple button.

## Quick Rules

1. **Always use theme color classes** - Never hard-code colors
2. **Test both themes** - Dark is default, but test light mode too
3. **Use CSS variables** - They automatically adapt to the theme

## Available Theme Colors

Use these Tailwind classes in your components:

### Backgrounds
- `bg-bg` - Page background
- `bg-surface` - Cards, elevated surfaces
- `bg-muted` - Subtle backgrounds (hover states, etc.)
- `bg-accent` - Primary brand color
- `bg-accent-soft` - Subtle accent backgrounds
- `bg-danger-soft` - Subtle error backgrounds

### Text
- `text-fg` - Primary text
- `text-muted-fg` - Secondary text
- `text-accent-fg` - Text on accent backgrounds

### Borders
- `border-line` - Strong borders
- `border-line-soft` - Subtle borders

### Special
- `shadow-brutal-sm` - Small brutal shadow
- `shadow-brutal` - Medium brutal shadow
- `shadow-brutal-lg` - Large brutal shadow

## Examples

### Good ✅
```tsx
<div className="bg-surface border border-line-soft rounded-xl p-4">
  <h2 className="text-fg font-semibold">Title</h2>
  <p className="text-muted-fg">Description</p>
</div>
```

### Bad ❌
```tsx
<div className="bg-white border border-gray-200 rounded-xl p-4">
  <h2 className="text-black font-semibold">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

## Custom Light Mode Styles

If you need theme-specific styles, use the `light:` variant:

```tsx
<div className="opacity-80 light:opacity-100">
  {/* More opaque in light mode */}
</div>
```

The `light:` variant targets `[data-theme="light"]` via a custom Tailwind variant defined in `globals.css`.

## Theme Toggle Component

The theme toggle is already integrated in:
- Marketing header (simple toggle button)
- Auth pages (top-right corner)
- Dashboard sidebar (bottom)

**Default behavior:**
- App opens in dark mode
- Sun icon (☀️) shown in dark mode → click to switch to light
- Moon icon (🌙) shown in light mode → click to switch to dark

## Testing Checklist

When adding new UI:
- [ ] Uses theme color classes only
- [ ] No hard-coded colors
- [ ] Tested in dark mode (default)
- [ ] Tested in light mode
- [ ] Sufficient contrast in both modes
- [ ] Borders visible in both modes
- [ ] Shadows look good in both modes

## Color Contrast

Ensure adequate contrast ratios:
- **Large text** (18px+): Minimum 3:1
- **Normal text**: Minimum 4.5:1
- **Interactive elements**: Minimum 3:1

The theme colors are designed to meet these standards, but verify when combining colors.

## Widget Integration

The feedback widget also supports theme control via the `data-theme` attribute:

```html
<script src="/widget.js"
  data-project="YOUR_PROJECT_ID"
  data-theme="auto"
  async>
</script>
```

Options:
- `auto` - Matches parent page theme (default)
- `light` - Force light theme
- `dark` - Force dark theme

**Note:** With `auto`, the widget will match your application's theme toggle automatically.
