import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import 'urlpattern-polyfill';

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

process.env.USER_TOKEN_NAME = 'user-service-token';
process.env.ADMIN_FRONTEND_URL = 'http://localhost:3001/apply/admin';
process.env.APPLICANT_FRONTEND_URL =
  'http://localhost:3000/apply/applicant/dashboard';
process.env.LOGIN_URL =
  'http://localhost:8082/login?redirectUrl=http://localhost:3000/apply/applicant/isAdmin';
process.env.SUB_PATH = '/apply/applicant';
process.env.BACKEND_HOST = 'http://localhost:8080';
process.env.APPLYING_FOR_REDIRECT_COOKIE = 'find_applying_for';
process.env.LOGOUT_URL = 'http://localhost:8082/logout';
process.env.COOKIE_SECRET =
  'E6AAAB815903D8CDD81246EFC8275C13EE34541134092A635572C8F7F47448BE';
process.env.HOST = 'http://localhost:3000/apply/applicant';
process.env.FRONTEND_HOST = 'http://localhost:3000';
process.env.REFRESH_URL = 'http://localhost:8082/refresh-token';
process.env.USER_SERVICE_URL = 'http://localhost:8082';
process.env.ONE_LOGIN_ENABLED = 'false';
process.env.V2_LOGIN_URL =
  'http://localhost:8082/v2/login?redirectUrl=http://localhost:3000/apply/applicant/isAdmin';
process.env.V2_LOGOUT_URL = 'http://localhost:8082/v2/logout';
process.env.JWT_COOKIE_NAME = 'user-service-token';
process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED = 'false';
process.env.ONE_LOGIN_SECURITY_URL =
  'https://home.integration.account.gov.uk/security';
