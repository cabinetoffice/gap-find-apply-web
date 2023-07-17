import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_URL = process.env.USER_SERVICE_HOST;
const BASE_USERS_URL = process.env.BACKEND_HOST + '/users';

const getLoggedInUsersDetails = async (sessionCookie: string) => {
  const response = await axios.get(
    `${BASE_USERS_URL}/loggedInUser`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

const getUserFromSub = async (sessionCookie: string, id: string) => {
  const response = await axios.get(
    `${BASE_URL}/user/${id}`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

export { getLoggedInUsersDetails, getUserFromSub };
