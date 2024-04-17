import { axios } from '../utils/axios';
import { axiosUserServiceConfig, axiosSessionConfig } from '../utils/session';
import UserDetails from '../types/UserDetails';

const BASE_USERS_URL = process.env.BACKEND_HOST + '/users';

export async function getLoggedInUsersDetails(
  sessionCookie: string
): Promise<UserDetails> {
  const response = await axios.get(
    `${BASE_USERS_URL}/loggedInUser`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
}

export async function isAdminSessionValid(sessionCookie: string) {
  const response = await fetch(`${BASE_USERS_URL}/validateAdminSession`, {
    headers: {
      Cookie: `SESSION=${sessionCookie};`,
    },
  });
  return (await response.text()) === 'true';
}

export async function checkNewAdminEmailIsValid(
  sessionCookie: string,
  jwt: string,
  newEmail: string,
  oldEmail: string
) {
  const response = await axios.post(
    `${BASE_USERS_URL}/validate-admin-email`,
    { emailAddress: newEmail, oldEmailAddress: oldEmail },
    {
      withCredentials: true,
      headers: {
        Cookie: `SESSION=${sessionCookie};${process.env.JWT_COOKIE_NAME}=${jwt}`,
      },
    }
  );
  return response.data;
}

export async function getUserRoles(token: string) {
  const { data } = await axios.get<UserRolesResponse>(
    `${process.env.USER_SERVICE_URL}/user/roles`,
    axiosUserServiceConfig(token)
  );
  return data;
}
export interface UserRolesResponse {
  isValid: boolean;
  isSuperAdmin?: boolean;
  isAdmin: boolean;
  isApplicant: boolean;
}
