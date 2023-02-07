module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    //https://jestjs.io/docs/webpack#handling-static-assets//
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
    clearMocks: true,
  },
};
