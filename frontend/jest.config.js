module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        // Handle CSS imports (with CSS modules)
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

        // Handle CSS imports (without CSS modules)
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

        // Handle image imports
        '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',

        // Handle module aliases (@/ -> )
        '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleDirectories: ['node_modules', '<rootDir>/'],
    collectCoverageFrom: [
        'components/**/*.{js,jsx,ts,tsx}',
        'app/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/build/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    transform: {
        // Use babel-jest to transpile tests
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-typescript',
                ['@babel/preset-react', { runtime: 'automatic' }]
            ]
        }],
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(@babel)/)',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
};
