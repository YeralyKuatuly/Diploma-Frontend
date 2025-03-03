/** @type {import('jest').Config} */
export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.json' }]
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    transformIgnorePatterns: [
        'node_modules/(?!(@testing-library|axios)/)'
    ],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    },
    extensionsToTreatAsEsm: ['.jsx'],
    injectGlobals: true,
    clearMocks: true,
    resetMocks: false,
    restoreMocks: false
}; 