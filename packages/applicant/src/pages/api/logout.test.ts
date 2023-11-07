import '@testing-library/jest-dom';
import { merge } from 'lodash';
import { getSessionIdFromCookies } from '../../utils/session';
import logout from './logout.page';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

jest.mock('../../utils/session');
jest.mock('axios');

const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides = {}) =>
  merge(
    {
      headers: {
        referer: `/referer`,
      },
      cookies: { sessionCookieName: 'testSessionId' },
    },
    overrides
  ) as unknown as NextApiRequest;

const res = (overrides = {}) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides
  ) as unknown as NextApiResponse;

describe('Logout page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGOUT = 'http://localhost:8082/logout';
  });

  it('Should clear back-end authentication session if there is session_id cookie available', async () => {
    (getSessionIdFromCookies as jest.Mock).mockReturnValue('testSessionId');
    await logout(req(), res());

    expect(axios.delete).toHaveBeenCalledTimes(1);
  });

  it('Should NOT try to clear back-end authentication session if session_id cookie not available', async () => {
    (getSessionIdFromCookies as jest.Mock).mockReturnValue('');
    await logout(req(), res());

    expect(axios.delete).toHaveBeenCalledTimes(0);
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
