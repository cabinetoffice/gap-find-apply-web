import axios from 'axios';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_URL = BACKEND_HOST;

const authenticateUser = async (cookieValue: string | undefined) => {
  const COOKIE_SECRET = process.env.COOKIE_SECRET!;

  // Implementation below replicates that of a lambda function
  // cabinet office have:
  // https://github.com/cabinetoffice/x-co-login-auth-lambda/blob/22ce5fa104d2a36016a79f914d238f53ddabcee4/src/controllers/http/v1/request/utils.js#L81
  const parsedCookie = cookie.parse(`connect.sid=${cookieValue}`)[
    'connect.sid'
  ];
  // If the cookie is not a signed cookie, the parser will return the provided value
  const unsignedCookie = cookieParser.signedCookie(parsedCookie, COOKIE_SECRET);

  if (!unsignedCookie) {
    throw new Error('Failed to verify cookie signature');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${unsignedCookie}`,
    },
  };

  return axios.post(`${getAdminLoginUrl()}/login`, {}, config);
};

const logoutUser = async (sessionCookie: string) => {
  return axios.delete(`${BASE_URL}/logout`, axiosSessionConfig(sessionCookie));
};

const getAdminLoginUrl = () => {
  return process.env.ONE_LOGIN_ENABLED === 'enabled'
    ? process.env.V2_BACKEND_HOST!
    : process.env.BACKEND_HOST!;
};

export { authenticateUser, logoutUser };
