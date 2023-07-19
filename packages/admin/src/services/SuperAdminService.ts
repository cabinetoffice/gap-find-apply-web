import getConfig from 'next/config';
import axios from 'axios';
import { axiosUserServiceConfig } from '../utils/session';
import Pagination from '../types/Pagination';
import { Department, User } from '../pages/super-admin-dashboard/types';
import { Role } from '../types/UserDetails';

const { serverRuntimeConfig } = getConfig();

export const getSuperAdminDashboard = async (
  pagination: Pagination,
  userToken: string
): Promise<{
  users: User[];
  departments: Department[];
  roles: Role[];
  userCount: number;
}> => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/super-admin-dashboard`,
    {
      params: pagination,
      ...axiosUserServiceConfig(userToken),
    }
  );
  return response.data;
};

export const getUserById = async (id: string, userToken: string) => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/user/${id}`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getChangeDepartmentPage = async (
  userId: string,
  userToken: string
): Promise<{
  user: User;
  departments: Department[];
}> => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/page/user/${userId}/change-department`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const updateDepartment = async (
  userId: string,
  departmentId: string,
  userToken: string
) => {
  const response = await axios.patch(
    `${serverRuntimeConfig.userServiceHost}/user/${userId}/department`,
    {},
    {
      params: { departmentId },
      ...axiosUserServiceConfig(userToken),
    }
  );
  return response.data;
};

export const getAllRoles = async (userToken: string) => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/role`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};
