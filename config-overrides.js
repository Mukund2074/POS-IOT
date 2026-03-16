const { override, addWebpackAlias, addPostcssPlugins } = require('customize-cra');
const path = require('path');

module.exports = override(
    addWebpackAlias({
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/assets': path.resolve(__dirname, 'src/assets'),
        '@/context': path.resolve(__dirname, 'src/context'),
        '@/data': path.resolve(__dirname, 'src/data'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/i18n': path.resolve(__dirname, 'src/i18n'),
        '@/scenes': path.resolve(__dirname, 'src/scenes'),
        '@/shared': path.resolve(__dirname, 'src/shared'),
        '@/test': path.resolve(__dirname, 'src/test'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@': path.resolve(__dirname, 'src'),
    }),
    // Add PostCSS support for Tailwind CSS
    addPostcssPlugins([
        require('tailwindcss'),
        require('autoprefixer'),
    ]),
);
