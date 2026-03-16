# Radix UI + Tailwind CSS Setup Guide

This document explains how to complete the setup for Radix UI and Tailwind CSS in your Fiind App.

## ✅ What's Already Done

1. ✅ Cursor rules added for Radix component naming convention
2. ✅ Tailwind CSS configuration (`tailwind.config.js`)
3. ✅ PostCSS configuration (`postcss.config.js`)
4. ✅ Webpack config updated (`config-overrides.js`)
5. ✅ Tailwind CSS file created with layers (`src/tailwind.css`)
6. ✅ Radix components directory structure created
7. ✅ Example Radix components created

## 📦 Installation Required

Run these commands to install the required packages:

```bash
# Install Tailwind CSS and PostCSS
npm install -D tailwindcss postcss autoprefixer

# Install Radix UI primitives (install as needed)
npm install @radix-ui/react-select
npm install @radix-ui/react-dialog
# Add more Radix primitives as you need them
```

## 🎯 Component Naming Convention

**ALL Radix components MUST be prefixed with "Radix"** (capital R):

- ✅ `RadixButton` - Correct
- ✅ `RadixSelect` - Correct
- ✅ `RadixDialog` - Correct
- ❌ `Button` - Wrong (conflicts with MUI)
- ❌ `Select` - Wrong (conflicts with MUI)

## 📁 Component Location

All Radix components should be in:
```
src/components/radix/
```

## 🎨 Styling Rules

- ✅ Use Tailwind CSS classes via `className` prop
- ✅ All styling done with Tailwind utilities
- ❌ Do NOT use MUI's `sx` prop on Radix components
- ❌ Do NOT use styled-components or Emotion for Radix components

## 🔄 Coexistence with MUI

- Radix and MUI components can coexist
- Use Radix for **new components**
- Keep existing MUI components **unchanged**
- Choose either Radix OR MUI per component, not both

## 📝 Usage Example

```tsx
import { RadixButton, RadixSelect, RadixDialog } from '@/components/radix';

function MyComponent() {
    return (
        <div className="p-4">
            <RadixButton variant="primary" size="md" className="mb-4">
                Click Me
            </RadixButton>
            
            <RadixSelect
                options={[
                    { value: '1', label: 'Option 1' },
                    { value: '2', label: 'Option 2' },
                ]}
                placeholder="Select..."
            />
        </div>
    );
}
```

## 🚀 Next Steps

1. Install the packages listed above
2. Start using Radix components for new features
3. Gradually migrate existing components if needed
4. Follow the cursor rules for naming conventions

## ⚠️ Important Notes

- Tailwind CSS is configured with `preflight: false` to avoid MUI conflicts
- CSS layers are used to control specificity
- Only use Tailwind on Radix components or custom HTML elements
- Do NOT apply Tailwind classes to MUI components

## 📚 Resources

- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- See `.cursorrules` for complete naming and usage guidelines

