import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['./setupJestMock.js'],
  resetMocks: true,
  isolatedModules: true,
  reporters: [['github-actions', { silent: false }], 'summary'],
  modulePathIgnorePatterns: ['cypress', 'node_modules', 'public'],
};

export default createJestConfig(config);
