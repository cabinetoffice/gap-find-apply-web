import getConfig from 'next/config';
import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';
import Pagination from '../types/Pagination';

const { serverRuntimeConfig } = getConfig();

export const getSuperAdminDashboard = async (
  pagination: Pagination,
  sessionId: string
) => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/super-admin-dashboard`,
    {
      params: pagination,
      ...axiosSessionConfig(sessionId),
    }
  );
  return response.data;
};

export const getUserById = async (id: string, sessionId: string) => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/user/${id}`,
    axiosSessionConfig(sessionId)
  );
  return response.data;
};
