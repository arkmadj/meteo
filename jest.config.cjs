module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  passWithNoTests: true,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // Allow Jest to transform a few ESM-based markdown dependencies so they can run in the
  // current CommonJS Jest environment.
  //
  // If additional ESM packages from the remark/rehype ecosystem are needed in tests
  // later, they can be added to this allowlist.
  transformIgnorePatterns: [
    '/node_modules/(?!react-markdown|remark-gfm|rehype-highlight|rehype-slug)/',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/index.tsx'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  watchman: false,
};
