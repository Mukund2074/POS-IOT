/**
 * Unified Design System Theme Tokens
 *
 * This is the SINGLE SOURCE OF TRUTH for all design tokens.
 * Contains ONLY raw design tokens - NO component-level styling.
 *
 * Usage:
 * - Import in tailwind.config.js to extend Tailwind utilities
 * - Use tokens directly in components via Tailwind classes
 * - Dark mode tokens are automatically applied when <html class="dark">
 */

const theme = {
    // Light Mode Colors
    colors: {
        // Primary Scale (Orange)
        primary: {
            50: '#FFF4E9',
            100: '#FFE3CC',
            200: '#FFC799',
            300: '#FFAC66',
            400: '#FF9747',
            500: '#FA873C',
            600: '#E27834',
            700: '#C7652D',
            800: '#A45225',
            900: '#803F1D',
            950: '#000000',
        },
        // Grey Scale
        grey: {
            50: '#FFFFFF',
            100: '#F5F5F5',
            200: '#F2F2F2',
            300: '#E0E0E0',
            400: '#C7CDD2',
            500: '#8B96A2',
            600: '#6E7882',
            700: '#4A5056',
            800: '#2A2E31',
            900: '#111111',
            950: '#000000',
        },
        // Success Color
        secondary: {
            50: '#E9F9F0',
            100: '#C8F0DA',
            200: '#91E2B8',
            300: '#90E4BC',
            400: '#5ED696',
            500: '#36C97C',
            600: '#19985A',
            700: '#147B4A',
            800: '#0F5E39',
            900: '#093E26',
            950: '#000000',
        },
        // Error Color
        red: {
            50: '#FFF5F5',
            100: '#FFE3E3',
            200: '#FFBDBD',
            300: '#FF9B9B',
            400: '#F86A6A',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
            950: '#000000',
        },
        // Orange Color
        orange: {
            50: '#FFF8E6',
            100: '#FFEFC2',
            200: '#FFDF85',
            300: '#FFCE47',
            400: '#FFBB1F',
            500: '#F5A100',
            600: '#DB8E00',
            700: '#B57200',
            800: '#8C5800',
            900: '#663F00',
            950: '#000000',
        },
        // Blue Color
        blue: {
            50: '#F3F8FC',
            100: '#E4EEF8',
            200: '#AECDEA',
            300: '#79ACDB',
            400: '#266CC8',
            500: '#0D6ABF',
            600: '#0A508F',
            700: '#063560',
            800: '#031A30',
            900: '#02101D',
            950: '#000000',
        },
        // Light Red Color
        lightRed: {
            50: '#FFF5F5',
            100: '#FEE4E4',
            200: '#FCBEBE',
            300: '#F99898',
            400: '#F57272',
            500: '#EF2324',
            600: '#D61516',
            700: '#AD1112',
            800: '#750B0C',
            900: '#3B0606',
            950: '#000000',
        },
        // Semantic Colors (Light Mode)
        background: {
            default: '#fcfcfc',
            paper: '#ffffff',
            subtle: '#f5f5f5',
        },
        text: {
            primary: '#141b2d',
            secondary: '#666666',
            disabled: '#a3a3a3',
            inverse: '#ffffff',
        },
        border: {
            default: '#e0e0e0',
            light: '#f5f5f5',
            dark: '#525252',
        },
        warning: {
            50: '#FFF8E6',
            100: '#FFEFC2',
            200: '#FFDF85',
            300: '#FFCE47',
            400: '#FFBB1F',
            500: '#F5A100',
        },
        error: {
            50: '#FFF5F5',
            100: '#FFE3E3',
            200: '#FFBDBD',
            300: '#FF9B9B',
            400: '#F86A6A',
            500: '#EF4444',
        },
    },

    // Dark Mode Colors
    darkColors: {
        // Primary Scale (inverted for dark mode)
        primary: {
            50: '#000000',
            100: '#803F1D',
            200: '#A45225',
            300: '#C7652D',
            400: '#E27834',
            500: '#FA873C',
            600: '#FF9747',
            700: '#FFAC66',
            800: '#FFC799',
            900: '#FFE3CC',
            950: '#FFF4E9',
        },
        // Grey Scale (inverted for dark mode)
        grey: {
            50: '#000000',
            100: '#111111',
            200: '#2A2E31',
            300: '#4A5056',
            400: '#6E7882',
            500: '#8B96A2',
            600: '#C7CDD2',
            700: '#E0E0E0',
            800: '#F2F2F2',
            900: '#F5F5F5',
            950: '#FFFFFF',
        },
        // Success Color (inverted for dark mode)
        secondary: {
            50: '#000000',
            100: '#093E26',
            200: '#0F5E39',
            300: '#147B4A',
            400: '#19985A',
            500: '#36C97C',
            600: '#5ED696',
            700: '#90E4BC',
            800: '#91E2B8',
            900: '#C8F0DA',
            950: '#E9F9F0',
        },
        // Error Color (inverted for dark mode)
        red: {
            50: '#000000',
            100: '#7F1D1D',
            200: '#991B1B',
            300: '#B91C1C',
            400: '#DC2626',
            500: '#EF4444',
            600: '#F86A6A',
            700: '#FF9B9B',
            800: '#FFBDBD',
            900: '#FFE3E3',
            950: '#FFF5F5',
        },
        // Orange Color (inverted for dark mode)
        orange: {
            50: '#000000',
            100: '#663F00',
            200: '#8C5800',
            300: '#B57200',
            400: '#DB8E00',
            500: '#F5A100',
            600: '#FFBB1F',
            700: '#FFCE47',
            800: '#FFDF85',
            900: '#FFEFC2',
            950: '#FFF8E6',
        },
        // Blue Color (inverted for dark mode)
        blue: {
            50: '#000000',
            100: '#02101D',
            200: '#031A30',
            300: '#063560',
            400: '#0A508F',
            500: '#0D6ABF',
            600: '#266CC8',
            700: '#79ACDB',
            800: '#AECDEA',
            900: '#E4EEF8',
            950: '#F3F8FC',
        },
        // Light Red Color (inverted for dark mode)
        lightRed: {
            50: '#000000',
            100: '#3B0606',
            200: '#750B0C',
            300: '#AD1112',
            400: '#D61516',
            500: '#EF2324',
            600: '#F57272',
            700: '#F99898',
            800: '#FCBEBE',
            900: '#FEE4E4',
            950: '#FFF5F5',
        },
        // Semantic Colors (Dark Mode)
        background: {
            default: '#141b2d',
            paper: '#1a2332',
            subtle: '#0c101b',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
            disabled: '#525252',
            inverse: '#141b2d',
        },
        border: {
            default: '#3d3d3d',
            light: '#292929',
            dark: '#666666',
        },
        warning: {
            50: '#000000',
            100: '#663F00',
            200: '#8C5800',
            300: '#B57200',
            400: '#DB8E00',
            500: '#F5A100',
        },
        error: {
            50: '#000000',
            100: '#7F1D1D',
            200: '#991B1B',
            300: '#B91C1C',
            400: '#DC2626',
            500: '#EF4444',
        },
    },

    // Typography
    fonts: {
        primary: '"Source Sans Pro", sans-serif',
        secondary: '"DM Sans", sans-serif',
        warning: '"DM Sans", sans-serif',
        error: '"DM Sans", sans-serif',
    },

    // Font Sizes
    fontSize: {
        // Headings
        h1: '2rem', // 30px - Main page titles
        h2: '1.625rem', // 24px - Section headers
        h3: '1.375rem', // 20px - Sub-section headers
        h4: '1.125rem', // 18px - Modal / card titles
        h5: '1rem', // 16px - Inline headers
        h6: '0.875rem', // 14px - Supporting headings
        // Body Text
        'body-l': '1rem', // 16px - Main body paragraphs
        'body-m': '0.875rem', // 14px - General text
        'body-s': '0.813rem', // 13px - Secondary text
        // Other
        caption: '0.75rem', // 12px - Labels, footnotes
        button: '0.938rem', // 15px - Buttons / CTAs
        // Legacy aliases for backward compatibility
        xs: '0.75rem', // 12px (alias for caption)
        sm: '0.875rem', // 14px (alias for body-m)
        base: '1rem', // 16px (alias for body-l)
        lg: '1.125rem', // 18px (alias for h4)
        xl: '1.25rem', // 20px (alias for h3)
        '2xl': '1.5rem', // 24px (close to h2)
        '3xl': '2rem', // 32px (close to h1)
        '4xl': '2.5rem', // 40px
    },

    // Font Weights
    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        // Legacy aliases for backward compatibility
        normal: 400, // alias for regular
    },

    // Line Heights
    lineHeight: {
        h1: '120%', // 1.2
        h2: '125%', // 1.25
        h3: '130%', // 1.3
        h4: '135%', // 1.35
        h5: '135%', // 1.35
        h6: '150%', // 1.5
        'body-l': '150%', // 1.5
        'body-m': '150%', // 1.5
        'body-s': '140%', // 1.4
        caption: '120%', // 1.2
        button: '150%', // 1.5 (default, not specified in guide)
        // Legacy aliases
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },

    // Spacing Scale
    spacing: {
        0: '0px',
        0.5: '0.125rem', // 2px
        1: '0.25rem', // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem', // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem', // 12px
        3.5: '0.875rem', // 14px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        7: '1.75rem', // 28px
        8: '2rem', // 32px
        9: '2.25rem', // 36px
        10: '2.5rem', // 40px
        11: '2.75rem', // 44px
        12: '3rem', // 48px
        14: '3.5rem', // 56px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        28: '7rem', // 112px
        32: '8rem', // 128px
        36: '9rem', // 144px
        40: '10rem', // 160px
        44: '11rem', // 176px
        48: '12rem', // 192px
        52: '13rem', // 208px
        56: '14rem', // 224px
        60: '15rem', // 240px
        64: '16rem', // 256px
        72: '18rem', // 288px
        80: '20rem', // 320px
        96: '24rem', // 384px
        // Legacy aliases for backward compatibility
        xs: '0.25rem', // 4px (alias for 1)
        sm: '0.5rem', // 8px (alias for 2)
        md: '1rem', // 16px (alias for 4)
        lg: '1.5rem', // 24px (alias for 6)
        xl: '2rem', // 32px (alias for 8)
        '2xl': '3rem', // 48px (alias for 12)
        '3xl': '4rem', // 64px (alias for 16)
    },

    // Border Radius
    radius: {
        none: '0',
        sm: '0.25rem', // 4px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
        full: '9999px',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },

    // Transitions
    transitions: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
    },
};

export default theme;
