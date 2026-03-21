const theme = require('./src/ui/theme.js');
const { screens } = require('./src/theme/screens');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],

    darkMode: 'class',

    // Use !important for all Tailwind classes so they work in Portal components
    // CSS layers ensure MUI styles still have proper precedence
    important: true,

    theme: {
        screens: screens,
        extend: {
            colors: theme.colors,
            fontFamily: {
                primary: theme.fonts.primary,
                secondary: theme.fonts.secondary,
                warning: theme.fonts.warning,
                error: theme.fonts.error,
            },
            fontSize: theme.fontSize,
            fontWeight: theme.fontWeight,
            spacing: theme.spacing,
            borderRadius: theme.radius,
            boxShadow: theme.shadows,
            transitionDuration: theme.transitions,
        },
    },

    plugins: [],

    corePlugins: {
        preflight: false, // avoid MUI conflicts
    },
};
