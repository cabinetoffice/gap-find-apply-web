import '@testing-library/jest-dom';
import { merge } from 'lodash';
import { getSessionIdFromCookies } from '../../utils/session';
import logout, { logoutAdmin } from './logout.page';

jest.mock('../../services/AuthService');
jest.mock('../../utils/session');

const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides: any = {}) =>
  merge(
    {
      headers: {
        referer: `/referer`,
      },
      cookies: { sessionCookieName: 'testSessionId' },
    },
    overrides
  );

const res = (overrides: any = {}) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides
  );

describe('Logout page', () => {
  beforeEach(() => {
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGOUT = 'http://localhost:8082/logout';
  });

  it('Should clear back-end authentication session if there is session_id cookie available', async () => {
    (getSessionIdFromCookies as jest.Mock).mockReturnValue('testSessionId');
    await logout(req(), res());

    expect(logoutAdmin).toHaveBeenCalledTimes(1);
  });

  it('Should NOT try to clear back-end authentication session if session_id cookie not available', async () => {
    (getSessionIdFromCookies as jest.Mock).mockReturnValue('');
    await logout(req(), res());

    expect(logoutAdmin).toHaveBeenCalledTimes(0);
  });

  it('Should clear session_id cookie', async () => {
    await logout(req(), res());

    expect(mockedSetHeader).toHaveBeenCalledTimes(1);
  });

  it('Should redirect to login page', async () => {
    process.env.V2_LOGOUT_URL = 'http://localhost:8082/logout';
    process.env.LOGOUT_URL = 'http://localhost:8082/logout';

    await logout(req(), res());

    expect(mockedRedirect).toHaveBeenNthCalledWith(
      1,
      302,
      'http://localhost:8082/logout'
    );
  });
});
