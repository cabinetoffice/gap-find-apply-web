import '@testing-library/jest-dom';
import { getServerSideProps } from './index.page';
import { authenticateUser } from '../services/AuthService';
import { expectObjectEquals, getContext, mockServiceMethod } from 'gap-web-ui';
import { AxiosResponseHeaders } from 'axios';

jest.mock('../services/AuthService');

const getDefaultContext = () => ({
  res: { setHeader: jest.fn() },
});

const mockedAuthenticateUser = jest.mocked(authenticateUser);

describe('Auth index page', () => {
  beforeEach(() => {
    process.env.JWT_COOKIE_NAME = 'jwt_cookie';
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGIN_URL =
      'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login';
    process.env.V2_LOGIN_URL =
      'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login';
    process.env.SESSION_COOKIE_NAME = 'gap-test';
    mockServiceMethod(mockedAuthenticateUser, () => ({
      headers: {
        'set-cookie': [
          `SESSION=test_session_id; Path=/; secure; HttpOnly; SameSite=Strict; Max-Age=900;`,
        ],
      } as AxiosResponseHeaders,
    }));
  });

  it('Should redirect to login page when user authentication fails', async () => {
    mockedAuthenticateUser.mockRejectedValue({});

    const result = await getServerSideProps(getContext(getDefaultContext));

    expectObjectEquals(result, {
      redirect: {
        destination: 'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login',
        permanent: false,
      },
    });
  });

  describe('User authentication successful', () => {
    it('Should redirect to dashboard if redirectUrl not set', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      });
    });

    it('Should redirect to redirectUrl if it IS set', async () => {
      const result = await getServerSideProps(
        getContext(getDefaultContext, {
          query: { redirectUrl: '/redirectUrl' },
        })
      );

      expectObjectEquals(result, {
        redirect: {
          destination: '/redirectUrl',
          permanent: false,
        },
      });
    });

    it('Should set a session cookie', async () => {
      const context = getContext(getDefaultContext);

      await getServerSideProps(context);

      expect(context.res.setHeader).toHaveBeenCalledTimes(1);
    });
  });
});
