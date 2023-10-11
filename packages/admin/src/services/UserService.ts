import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';
import UserDetails from '../types/UserDetails';

const BASE_USERS_URL = process.env.BACKEND_HOST + '/users';

const getLoggedInUsersDetails = async (
  sessionCookie: string
): Promise<UserDetails> => {
  const response = await axios.get(
    `${BASE_USERS_URL}/loggedInUser`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

const isAdminSessionValid = async (sessionCookie: string) => {
  const response = await fetch(`${BASE_USERS_URL}/validateAdminSession`, {
    headers: {
      Cookie: `SESSION=${sessionCookie};`,
    },
  });
  return (await response.text()) === 'true';
};

export { getLoggedInUsersDetails, isAdminSessionValid };
