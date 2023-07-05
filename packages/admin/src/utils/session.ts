import { IncomingMessage } from 'http';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { NextApiRequest } from 'next';

export const getSessionIdFromCookies = (
  req: (IncomingMessage & { cookies: NextApiRequestCookies }) | NextApiRequest
) => {
  if (!process.env.SESSION_COOKIE_NAME) {
    throw new Error('The SESSION_COOKIE_NAME env var has not been set.');
  }
  return req.cookies[process.env.SESSION_COOKIE_NAME] || '';
};

export const axiosSessionConfig = (sessionId: string) => {
  return {
    withCredentials: true,
    headers: {
      Cookie: `SESSION=${sessionId};`,
    },
  };
};
