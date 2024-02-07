import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionIdFromCookies } from '../../utils/session';
import { logoutUser } from '../../services/AuthService';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';

const logout = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionCookie = getSessionIdFromCookies(req);

  if (sessionCookie) await logoutUser(sessionCookie);

  res.setHeader(
    'Set-Cookie',
    `session_id=deleted; Path=/; secure; HttpOnly; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  const logoutUrl =
    process.env.ONE_LOGIN_ENABLED === 'true'
      ? process.env.V2_LOGOUT_URL
      : process.env.LOGOUT_URL;

  res.redirect(302, logoutUrl);
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, logout);
