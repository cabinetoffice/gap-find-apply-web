import { NextApiRequest } from 'next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { NextIncomingMessage } from 'next/dist/server/request-meta';

const getSessionIdFromCookies = (
  req:
    | (NextIncomingMessage & { cookies: NextApiRequestCookies })
    | NextApiRequest
) => {
  if (!process.env.SESSION_COOKIE_NAME) {
    throw new Error('The SESSION_COOKIE_NAME env var has not been set.');
  }
  return req.cookies[process.env.SESSION_COOKIE_NAME] || '';
};

export { getSessionIdFromCookies };
