import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionIdFromCookies } from '../../../src/utils/session';
import axios from 'axios';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';

const Logout = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionCookie = getSessionIdFromCookies(req);
  if (sessionCookie) await logoutAdmin(sessionCookie);
  res.setHeader(
    'Set-Cookie',
    `session_id=deleted; Path=/; secure; HttpOnly; SameSite=Strict; expires=Thu, 01 Jan 2003 00:00:00 GMT`
  );
  const logoutUrl =
    process.env.ONE_LOGIN_ENABLED === 'true'
      ? process.env.V2_LOGOUT_URL
      : process.env.LOGOUT_URL;

  res.redirect(302, logoutUrl);
};

const getAxiosSessionConfig = (sessionId: string) => ({
  withCredentials: true,
  headers: {
    Cookie: `SESSION=${sessionId};`,
  },
});

const logoutAdmin = async (sessionCookie: string) =>
  axios.delete(
    `${process.env.ADMIN_BACKEND_HOST}/logout`,
    getAxiosSessionConfig(sessionCookie)
  );

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, Logout);
