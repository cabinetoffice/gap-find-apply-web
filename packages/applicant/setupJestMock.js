import '@testing-library/jest-dom';

jest.mock('csurf', () => {
  return {
    __esModule: true,
    default: () => (req, res, callback) => {
      callback({});
    },
  };
});

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
      FIND_A_GRANT_URL: 'https://www.find-government-grants.service.gov.uk',
    },
  };
});
