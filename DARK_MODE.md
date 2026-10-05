# Dark Mode Implementation

This application uses dark mode by default with a simple toggle button to switch to light mode.

## Features

✅ **Dark Mode Default** - Application starts in dark mode
✅ **Simple Toggle** - Single button to switch between light and dark
✅ **No Flash on Load** - Theme is applied before first paint using inline script
✅ **Persistent Selection** - Theme choice is saved to localStorage
✅ **Accessible** - Proper ARIA labels and keyboard navigation
✅ **Smooth Transitions** - Colors transition smoothly between themes

## Theme Toggle Locations

The theme toggle button is available in:
- **Marketing pages** - Top right corner of the header (Sun ☀️ icon)
- **Auth pages** (Login/Signup) - Top right corner
- **Dashboard** - Bottom of the sidebar (above Sign out button)

## How It Works

### 1. CSS Custom Properties (`app/globals.css`)

Dark mode is the default theme. Light mode is applied when `[data-theme="light"]` is set:

```css
:root {
  /* Dark mode colors (default) */
  --bg: #0f0f0e;
  --surface: #171716;
  --fg: #f1f1ea;
  /* ... other dark theme colors */
}

[data-theme="light"] {
  /* Light mode colors */
  --bg: #fafaf7;
  --surface: #ffffff;
  --fg: #121211;
  /* ... other light theme colors */
}
```

### 2. Theme Toggle Component (`components/ui/theme-toggle.tsx`)

Simple toggle button:
- **Dark mode** (default) - Shows Sun ☀️ icon (click to switch to light)
- **Light mode** - Shows Moon 🌙 icon (click to switch to dark)

### 3. No-Flash Script

An inline script in the `<head>` applies the theme before first paint:

```javascript
// Simplified version
const theme = localStorage.getItem('fbx-theme') || 'dark';
document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
```

## Color Palette

### Dark Theme (Default)
- **Background**: `#0f0f0e` - Deep dark
- **Surface**: `#171716` - Slightly lighter for contrast
- **Text**: `#f1f1ea` - Warm off-white
- **Accent**: `#ff6b35` - Vibrant orange for dark backgrounds

### Light Theme
- **Background**: `#fafaf7` - Warm off-white
- **Surface**: `#ffffff` - Pure white for cards
- **Text**: `#121211` - Near black
- **Accent**: `#ff5a1f` - Vibrant orange

## Using Theme Colors in Components

All UI components use CSS custom properties through Tailwind's color system:

```tsx
// Good - Uses theme-aware colors
<div className="bg-surface text-fg border-line">

// Bad - Hard-coded colors (won't adapt to theme)
<div className="bg-white text-black border-gray-300">
```

## Available Theme Colors

- `bg` - Page background
- `surface` - Card/elevated backgrounds
- `fg` - Primary text
- `muted` - Subtle backgrounds
- `muted-fg` - Secondary text
- `line` - Strong borders
- `line-soft` - Subtle borders
- `accent` - Brand/primary actions
- `accent-fg` - Text on accent backgrounds
- `accent-soft` - Subtle accent backgrounds
- `danger` - Error/destructive actions
- `danger-soft` - Subtle danger backgrounds

## Custom Tailwind Variant

A custom `light:` variant is available that targets `[data-theme="light"]`:

```tsx
<div className="bg-surface light:shadow-lg">
  {/* Different shadow in light mode */}
</div>
```

## Viewport Theme Color

The `<meta name="theme-color">` automatically adapts:
- Dark mode (default): `#0f0f0e`
- Light mode: `#fafaf7`

This colors the browser UI (address bar, status bar) on mobile devices.

## Testing

To test the theme toggle:

1. **System preference**: Application opens in dark mode by default
2. **Manual toggle**: Click the Sun ☀️ icon to switch to light mode
3. **Persistence**: Refresh the page - your choice should persist
4. **No flash**: Reload in both themes - should be no flash of wrong theme

## Accessibility

- Theme toggle uses a simple button with clear `aria-label`
- Sun icon (☀️) shown in dark mode = "Switch to light mode"
- Moon icon (🌙) shown in light mode = "Switch to dark mode"
- Keyboard accessible with standard navigation

## Browser Support

- Modern browsers: Full support
- Legacy browsers without `localStorage`: Falls back to system preference
- Browsers without custom properties: Unsupported (requires modern browser)

## Maintenance

When adding new UI components:
1. Use existing theme color classes (`bg-surface`, `text-fg`, etc.)
2. Avoid hard-coded colors
3. Test in both light and dark themes
4. Ensure sufficient contrast in both modes
