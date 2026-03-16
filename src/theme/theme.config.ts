/**
 * Centralized Theme Configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for all theme values.
 * To change the entire app theme, modify this file or switch to a different theme file.
 *
 * Future: To add a second theme, create theme.config.dark.ts and import it here.
 */

export const themeConfig = {
    // Color Tokens
    colors: {
        // Primary Colors
        primary: {
            50: '#fff4e9',
            100: '#fef3ed',
            200: '#fde6db',
            300: '#fbd4c4',
            400: '#f9bda8',
            500: '#FA873C',
            600: '#e8762f',
            700: '#c66326',
            800: '#a4501e',
            900: '#823d17',
        },
        // Secondary Colors
        secondary: {
            100: '#dbf5ee',
            200: '#b7ebde',
            300: '#94e2cd',
            400: '#70d8bd',
            500: '#4cceac',
            600: '#3da58a',
            700: '#2e7c67',
            800: '#1e5245',
            900: '#0f2922',
        },
        // Gray Scale
        grey: {
            100: '#e0e0e0',
            200: '#c2c2c2',
            300: '#a3a3a3',
            400: '#858585',
            500: '#666666',
            600: '#525252',
            700: '#3d3d3d',
            800: '#292929',
            900: '#141414',
        },
        // Accent Colors
        redAccent: {
            100: '#f8dcdb',
            200: '#f1b9b7',
            300: '#e99592',
            400: '#e2726e',
            500: '#db4f4a',
            600: '#af3f3b',
            700: '#832f2c',
            800: '#58201e',
            900: '#2c100f',
        },
        blueAccent: {
            100: '#e1e2fe',
            200: '#c3c6fd',
            300: '#a4a9fc',
            400: '#868dfb',
            500: '#6870fa',
            600: '#535ac8',
            700: '#3e4396',
            800: '#2a2d64',
            900: '#151632',
        },
        // Semantic Colors
        background: {
            default: '#fcfcfc',
            paper: '#ffffff',
        },
        text: {
            primary: '#141b2d',
            secondary: '#666666',
            disabled: '#a3a3a3',
        },
        border: {
            default: '#e0e0e0',
            light: '#f5f5f5',
            dark: '#525252',
        },
    },

    // Typography
    typography: {
        fontFamily: {
            primary: ['Source Sans Pro', 'sans-serif'].join(','),
            secondary: ['DM Sans', 'sans-serif'].join(','),
        },
        fontSize: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '20px',
            '2xl': '24px',
            '3xl': '32px',
            '4xl': '40px',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },

    // Spacing (in pixels, can be converted to rem/px as needed)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
    },

    // Border Radius
    borderRadius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },

    // Breakpoints (for responsive design)
    breakpoints: {
        xs: '0px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px',
    },
} as const;

// Export type for TypeScript
export type ThemeConfig = typeof themeConfig;
