import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';
import { UserRolesResponse } from './UserRolesService';
import { axios } from '../utils/axios';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

//TODO add unit test
export async function isAdmin(token: string) {
  const { data } = await axios.get<UserRolesResponse>(
    `${BACKEND_HOST}/jwt/isAdmin`,
    axiosConfig(token)
  );
  return data;
}
