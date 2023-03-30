import type { NextApiRequest, NextApiResponse } from 'next';
import { getSessionIdFromCookies } from '../../utils/session';
import { logoutUser } from '../../services/AuthService';

const logout = async (req: NextApiRequest, res: NextApiResponse) => {
  const sessionCookie = getSessionIdFromCookies(req);

  if (sessionCookie) await logoutUser(sessionCookie);

  res.setHeader(
    'Set-Cookie',
    `session_id=deleted; Path=/; secure; HttpOnly; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  res.redirect(302, process.env.LOGOUT_URL!);
};

export default logout;
