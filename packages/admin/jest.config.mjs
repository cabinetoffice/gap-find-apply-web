import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config = {
  displayName: 'admin',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./setupJestMock.js'],
  resetMocks: true,
  reporters: [['github-actions', { silent: false }], 'summary'],
  modulePathIgnorePatterns: [
    '<rootDir>/cypress',
    '<rootDir>/node_modules',
    '<rootDir>/public',
  ],
};

export default createJestConfig(config);
