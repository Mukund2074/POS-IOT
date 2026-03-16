# 🎨 Centralized Theme System

## Overview

All theme values are now centralized in **one single source of truth**: `src/theme/theme.config.ts`

This makes it easy to:
- ✅ Switch entire app theme by changing one file
- ✅ Maintain consistency across MUI and Tailwind
- ✅ Add dual themes (light/dark) in the future
- ✅ Update colors, spacing, typography globally

## 📁 File Structure

```
src/
├── theme/
│   ├── theme.config.ts    ⭐ SINGLE SOURCE OF TRUTH
│   ├── theme.css          (CSS variables)
│   ├── mui.theme.ts       (MUI theme creator)
│   ├── index.ts           (Exports)
│   └── README.md          (Detailed docs)
├── theme.js               (Backward compatibility wrapper)
└── index.js               (Imports theme.css)
```

## 🎯 How It Works

1. **`theme.config.ts`** defines all theme values
2. **`theme.css`** converts them to CSS variables
3. **`mui.theme.ts`** creates MUI theme from config
4. **`tailwind.config.js`** uses CSS variables for Tailwind classes

## 🔄 Switching Themes (Future)

To add a second theme, you have two options:

### Option 1: Create a new theme file

```ts
// src/theme/theme.config.dark.ts
export const darkThemeConfig = {
  colors: {
    primary: { /* dark theme colors */ },
    // ... rest of dark theme
  }
};

// src/theme/theme.config.ts
import { darkThemeConfig } from './theme.config.dark';
export const themeConfig = isDarkMode ? darkThemeConfig : lightThemeConfig;
```

### Option 2: Add theme mode to existing config

```ts
// src/theme/theme.config.ts
export const getThemeConfig = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
```

## 📝 Usage Examples

### MUI Components
```tsx
import { useMode } from '@/theme';

const [theme] = useMode();
<Button sx={{ bgcolor: theme.palette.primary.main }}>Click</Button>
```

### Radix/Tailwind Components
```tsx
<RadixButton className="bg-primary-500 text-primary-300">
  Click
</RadixButton>
```

### CSS Variables (Direct)
```tsx
<div style={{ color: 'var(--color-primary-500)' }}>Text</div>
```

## ⚠️ Important Rules

1. **NEVER** hardcode colors, spacing, or typography
2. **ALWAYS** use values from `theme.config.ts` or CSS variables
3. **ALWAYS** import from `@/theme` (not `./theme.js`)
4. To change entire app theme → modify `theme.config.ts`

## 🔗 Backward Compatibility

- Old `src/theme.js` still works (re-exports from new system)
- All existing imports continue to work
- No breaking changes to existing code

## 🚀 Next Steps

1. ✅ Centralized theme system created
2. ✅ CSS variables set up
3. ✅ MUI theme integrated
4. ✅ Tailwind config updated
5. ⏳ Future: Add dark theme when needed

---

**To change the entire app theme, just modify `src/theme/theme.config.ts`!**

