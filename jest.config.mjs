// Add any custom config to be passed to Jest
const config = {
  reporters: [['github-actions', { silent: false }], 'summary'],
  projects: [
    {
      displayName: 'admin',
      rootDir: './packages/admin',
      setupFilesAfterEnv: ['./setupJestMock.js'],
      moduleDirectories: ['node_modules', '<rootDir>/'],
      resetMocks: true,
      testEnvironment: 'jest-environment-jsdom',
      modulePathIgnorePatterns: [
        '<rootDir>/cypress',
        '<rootDir>/node_modules',
        '<rootDir>/public',
      ],
      moduleNameMapper: {
        '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
      },
    },
    {
      displayName: 'applicant',
      setupFilesAfterEnv: ['./packages/applicant/setupJestMock.js'],
      testMatch: ['./packages/applicant/**/*.test.*'],
      moduleDirectories: ['node_modules', '<rootDir>/packages/applicant'],
      testEnvironment: 'jest-environment-jsdom',
      testPathIgnorePatterns: ['<rootDir>/cypress/', '.data.js'],
    },
  ],
};

export default config;
