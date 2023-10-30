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
      rootDir: './packages/applicant',
      setupFilesAfterEnv: ['./setupJestMock.js'],
      moduleDirectories: ['node_modules', '<rootDir>/'],
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
      displayName: 'gap-web-ui',
      rootDir: './packages/gap-web-ui',
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
        //https://jestjs.io/docs/webpack#handling-static-assets//
        '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
        clearMocks: true,
      },
    },
  ],
};

export default config;
