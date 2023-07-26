import getConfig from 'next/config';
import axios from 'axios';
import { axiosUserServiceConfig } from '../utils/session';
import Pagination from '../types/Pagination';
import { Department, Role, User } from '../pages/super-admin-dashboard/types';
import UserDetails from '../types/UserDetails';

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
  console.log(serverRuntimeConfig.userServiceHost);

  const response = await axios.get<UserDetails>(
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
  await axios.patch(
    `${serverRuntimeConfig.userServiceHost}/user/${userId}/department`,
    {},
    {
      params: { departmentId },
      ...axiosUserServiceConfig(userToken),
    }
  );
};

export const getAllRoles = async (userToken: string) => {
  const response = await axios.get<Role[]>(
    `${serverRuntimeConfig.userServiceHost}/role`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getAllDepartments = async (userToken: string) => {
  const response = await axios.get<Department[]>(
    `${serverRuntimeConfig.userServiceHost}/department`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const updateUserRoles = async (
  id: string,
  newUserRoles: string | string[],
  userToken: string
) => {
  await axios.patch(
    `${process.env.USER_SERVICE_URL}/user/${id}/role`,
    typeof newUserRoles === 'string' ? [newUserRoles] : newUserRoles,
    axiosUserServiceConfig(userToken)
  );
};

export const getUserRoles = async (
  id: string,
  newUserRoles: string | string[],
  userToken: string
) => {
  await axios.patch(
    `${process.env.USER_SERVICE_URL}/user/${id}/role`,
    typeof newUserRoles === 'string' ? [newUserRoles] : newUserRoles,
    axiosUserServiceConfig(userToken)
  );
};

export const getDepartment = async (id: number, userToken: string) =>
  axios.patch(
    `${process.env.USER_SERVICE_URL}/department`,
    id,
    axiosUserServiceConfig(userToken)
  );
