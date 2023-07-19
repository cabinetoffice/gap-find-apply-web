import axios from 'axios';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

//TODO add unit test
export async function getUserRoles(token: string) {
  const { data } = await axios.get<UserRolesResponse>(
    `${serverRuntimeConfig.backendHost}/jwt/userRoles`,
    axiosConfig(token)
  );
  return data;
}

export interface UserRolesResponse {
  isValid: boolean;
  isSuperAdmin?: boolean;
  isAdmin: boolean;
  isApplicant: boolean;
}
