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

export const getUserTokenFromCookies = (
  req: (IncomingMessage & { cookies: NextApiRequestCookies }) | NextApiRequest
) => {
  if (!process.env.JWT_COOKIE_NAME) {
    throw new Error('The JWT_COOKIE_NAME env var has not been set.');
  }
  return req.cookies[process.env.JWT_COOKIE_NAME] || '';
};

export type AxiosConfig = ReturnType<typeof axiosSessionConfig> & {
  headers: ReturnType<typeof axiosSessionConfig>['headers'] & {
    'Content-Type'?: string;
  };
};

export const axiosSessionConfig = (sessionId: string) => {
  return {
    withCredentials: true,
    headers: {
      Cookie: `SESSION=${sessionId};`,
    },
  };
};

export const axiosUserServiceConfig = (userToken: string) => ({
  withCredentials: true,
  headers: {
    Cookie: `${process.env.JWT_COOKIE_NAME}=${userToken}`,
  },
});
