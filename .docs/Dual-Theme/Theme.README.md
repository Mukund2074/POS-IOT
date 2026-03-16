# Centralized Theme System

This directory contains the **single source of truth** for all theme values in the application.

## 🎯 Purpose

All theme values (colors, typography, spacing, etc.) are defined in one place, making it easy to:
- Switch between themes (light/dark, brand variations, etc.)
- Maintain consistency across MUI and Tailwind components
- Update the entire app's appearance by changing one file

## 📁 File Structure

```
src/theme/
├── theme.config.ts    # Main theme configuration (SINGLE SOURCE OF TRUTH)
├── theme.css          # CSS variables generated from theme config
├── mui.theme.ts       # MUI theme creator (uses theme.config.ts)
└── index.ts           # Exports for backward compatibility
```

## 🔧 How It Works

1. **`theme.config.ts`** - Defines all theme values (colors, typography, spacing, etc.)
2. **`theme.css`** - Converts theme values to CSS variables (`--color-primary-500`, etc.)
3. **`mui.theme.ts`** - Creates MUI theme from `theme.config.ts`
4. **`tailwind.config.js`** - Uses CSS variables for Tailwind classes

## 🎨 Usage

### In MUI Components

```tsx
import { useMode } from '@/theme';

function MyComponent() {
  const [theme] = useMode();
  
  return (
    <Button sx={{ backgroundColor: theme.palette.primary.main }}>
      Click Me
    </Button>
  );
}
```

### In Radix/Tailwind Components

```tsx
// Use Tailwind classes that reference CSS variables
<RadixButton className="bg-primary-500 text-primary-300 px-md py-sm rounded-md">
  Click Me
</RadixButton>
```

### Direct CSS Variable Usage

```tsx
<div style={{ backgroundColor: 'var(--color-primary-500)' }}>
  Content
</div>
```

## 🔄 Switching Themes (Future)

To add a second theme (e.g., dark mode):

1. Create `theme.config.dark.ts` with dark theme values
2. Update `theme.config.ts` to export the dark config
3. Or create a theme switcher that dynamically loads different configs

Example:
```ts
// theme.config.ts
export const lightTheme = { /* current values */ };
export const darkTheme = { /* dark values */ };

// Switch based on user preference
export const themeConfig = isDarkMode ? darkTheme : lightTheme;
```

## 📝 Adding New Theme Values

1. Add the value to `theme.config.ts`
2. Add corresponding CSS variable to `theme.css`
3. Update `mui.theme.ts` if it's a MUI-specific value
4. Update `tailwind.config.js` if it should be available as a Tailwind class

## ⚠️ Important Rules

- **NEVER** hardcode colors, spacing, or typography values in components
- **ALWAYS** use values from `theme.config.ts` or CSS variables
- **ALWAYS** import theme from `@/theme` (not from old `./theme.js`)
- To change the entire app theme, modify `theme.config.ts` or switch theme files

## 🔗 Backward Compatibility

The old `src/theme.js` file is still supported through `src/theme/index.ts` exports:
- `useMode()` hook still works
- `themeSettings()` function still works
- `tokens` export still works

However, new code should use the centralized theme system.

