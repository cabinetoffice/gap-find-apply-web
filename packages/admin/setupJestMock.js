import '@testing-library/jest-dom';
import 'isomorphic-fetch';

HTMLFormElement.prototype.requestSubmit = jest.fn();

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
