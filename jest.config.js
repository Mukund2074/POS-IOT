module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': 'babel-jest', // now handles .ts, .tsx, .js, .jsx
    },
    transformIgnorePatterns: ['node_modules/(?!(axios)/)'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^axios$': require.resolve('axios'),
    },
    setupFiles: ['<rootDir>/src/test/setup.js'],
};
