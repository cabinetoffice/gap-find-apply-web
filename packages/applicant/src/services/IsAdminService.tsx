import axios from 'axios';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost ;

//TODO add unit test
export async function isAdmin(token: string) {
  const { data } = await axios.get<IsAdminResponse>(
    `${BACKEND_HOST}/jwt/isAdmin`,
    axiosConfig(token)
  );
  return data;
}

export interface IsAdminResponse {
  isValid: boolean;
  isAdmin: boolean;
  isApplicant: boolean;
}
