/**
 * Theme Exports
 *
 * This is the main entry point for all theme-related functionality.
 * Import from here to use the theme throughout the app.
 */

import { createContext, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import { tokens, themeSettings } from './mui.theme';

// Re-export tokens and themeSettings
export { tokens, themeSettings } from './mui.theme';

// Re-export for backward compatibility
export const greenAccent = tokens.greenAccent;
export const redAccent = tokens.redAccent;
export const blueAccent = tokens.blueAccent;

export const ColorModeContext = createContext({
    toggleColorMode: () => {},
});

export const useMode = () => {
    const theme = useMemo(() => createTheme(themeSettings()), []);
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {},
        }),
        [],
    );
    return [theme, colorMode];
};
