# Theme Toggle Changes

## What Changed

### Before ❌
- Three-button toggle (Light | Dark | System)
- Light mode was default
- System preference option
- More complex UI

### After ✅
- Single toggle button (Sun ☀️ / Moon 🌙)
- **Dark mode is default**
- Simple, clean interface
- Just two options: Dark or Light

## Visual Changes

### Toggle Button

**Before:**
```
┌─────────────────────┐
│ ☀️  🌙  💻 │  (3 buttons in a row)
└─────────────────────┘
```

**After:**
```
┌─────┐
│ ☀️ │  (single button - shown in dark mode)
└─────┘

┌─────┐
│ 🌙 │  (single button - shown in light mode)
└─────┘
```

## User Experience

### Dark Mode (Default) 🌙
- User opens the app → Dark interface
- Sees Sun icon (☀️) in header
- Clicks Sun → Switches to light mode
- Choice saved to localStorage

### Light Mode ☀️
- After toggling from dark
- Sees Moon icon (🌙) in header
- Clicks Moon → Returns to dark mode
- Choice saved to localStorage

## Technical Changes

### CSS
```css
/* Before */
:root { /* light colors */ }
[data-theme="dark"] { /* dark colors */ }

/* After */
:root { /* dark colors */ }  ← Dark is default now
[data-theme="light"] { /* light colors */ }
```

### Tailwind Variant
```css
/* Before */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* After */
@custom-variant light (&:where([data-theme="light"], [data-theme="light"] *));
```

### Theme Toggle Component

**Before:**
- 3 options: light, dark, system
- Radio group UI pattern
- System preference detection
- More complex state management

**After:**
- 2 options: light, dark
- Simple toggle button
- No system preference option
- Simpler code and UX

## Why These Changes?

1. **Simpler UX** - One button instead of three choices
2. **Clear default** - Users know they start with dark mode
3. **Visual clarity** - Icon changes show current state clearly
4. **Less complexity** - No need to explain "system" preference
5. **Modern approach** - Dark mode first is increasingly common

## Migration Notes

For existing users:
- If they had "system" preference → defaults to dark mode
- If they had "light" or "dark" → preference is preserved
- localStorage key remains the same (`fbx-theme`)

## Benefits

✅ Cleaner UI with single button
✅ Dark mode first (modern, popular)
✅ Easier to understand for users
✅ Less code to maintain
✅ Faster interaction (one click, not choosing from 3)
