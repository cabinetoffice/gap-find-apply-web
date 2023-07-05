import '@testing-library/jest-dom';
import NextGetServerSidePropsResponse from '../types/NextGetServerSidePropsResponse';
import { merge } from 'lodash';
import { getServerSideProps } from './index.page';
import { authenticateUser } from '../services/AuthService';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});

jest.mock('../services/AuthService');

jest.mock('../utils/general.ts', () => ({
  getLoginUrl: () => 'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login',
}));

const getContext = (overrides: any = {}) =>
  merge(
    {
      req: {
        cookies: { jwt_cookie: 'jwt token', 'gap-test': 'testSessionId' },
      },
      method: 'GET',
      query: {},
      res: { setHeader: jest.fn() },
    },
    overrides
  );

describe('Auth index page', () => {
  beforeEach(() => {
    process.env.JWT_COOKIE_NAME = 'jwt_cookie';
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGIN_URL =
      'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login';
    process.env.SESSION_COOKIE_NAME = 'gap-test';

    (authenticateUser as jest.Mock).mockResolvedValue({
      headers: {
        'set-cookie': [
          `SESSION=test_session_id; Path=/; secure; HttpOnly; SameSite=Strict; Max-Age=900;`,
        ],
      },
    });
  });

  it('Should redirect to login page when user authentication fails', async () => {
    (authenticateUser as jest.Mock).mockRejectedValue({});

    const result = (await getServerSideProps(
      getContext()
    )) as NextGetServerSidePropsResponse;

    expect(result).toStrictEqual({
      redirect: {
        destination: 'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login',
        permanent: false,
      },
    });
  });

  describe('User authentication successful', () => {
    it('Should redirect to dashboard', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual({
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      });
    });

    it('Should set a session cookie', async () => {
      const context = getContext();
      (await getServerSideProps(context)) as NextGetServerSidePropsResponse;

      expect(context.res.setHeader).toHaveBeenCalledTimes(1);
    });
  });
});
