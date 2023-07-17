import getConfig from 'next/config';
import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';
import Pagination from '../types/Pagination';
import { Department, User } from '../pages/super-admin-dashboard/types';

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

export const getChangeDepartmentPage = async (
  userId: string,
  sessionId: string
): Promise<{
  user: User;
  departments: Department[];
}> => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/page/user/${userId}/change-department`,
    axiosSessionConfig(sessionId)
  );
  return response.data;
};

export const updateDepartment = async (
  sessionId: string,
  userId: string,
  departmentId: string
) => {
  const response = await axios.patch(
    `${serverRuntimeConfig.userServiceHost}/user/${userId}/department`,
    {},
    {
      params: {
        departmentId,
      },
      ...axiosSessionConfig(sessionId),
    }
  );
  return response.data;
};
