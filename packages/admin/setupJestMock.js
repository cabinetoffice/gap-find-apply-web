import '@testing-library/jest-dom';
import 'isomorphic-fetch';

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  };
});

jest.mock('next/config', () => {
  return {
    __esModule: true,
    default: () => ({
      publicRuntimeConfig: {
        SUB_PATH: '/apply',
        APPLICANT_DOMAIN: 'http://localhost:3000',
        FIND_A_GRANT_URL: 'https://www.find-government-grants.service.gov.uk',
        TECHNICAL_SUPPORT_DOMAIN: 'mocked-technical-support-domain',
      },
      serverRuntimeConfig: {
        backendHost: 'http://localhost:8080',
      },
    }),
  };
});

jest.mock('csurf', () => {
  return {
    __esModule: true,
    default: () => (req, res, callback) => {
      callback({});
    },
  };
});
