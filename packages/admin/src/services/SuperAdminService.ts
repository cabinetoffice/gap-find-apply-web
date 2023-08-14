import { Pagination } from '../components/pagination/Pagination';
import { SuperAdminDashboardResponse } from './../pages/super-admin-dashboard/types';
import getConfig from 'next/config';
import axios from 'axios';
import { axiosUserServiceConfig } from '../utils/session';
import {
  Department,
  Role,
  SuperAdminDashboardFilterData,
  User,
} from '../pages/super-admin-dashboard/types';
import UserDetails from '../types/UserDetails';
import PaginationType from '../types/Pagination';

const { serverRuntimeConfig } = getConfig();

type GetSuperAdminDashboardParams = {
  pagination: PaginationType;
  userToken: string;
  filterData: SuperAdminDashboardFilterData;
  resetPagination?: boolean;
};

export const getSuperAdminDashboard = async ({
  pagination,
  userToken,
  filterData: {
    roles = [],
    departments = [],
    searchTerm = '',
    clearAllFilters = false,
  },
}: GetSuperAdminDashboardParams): Promise<SuperAdminDashboardResponse> => {
  console.log({ searchTerm });

  const params = {
    ...pagination,
    roles: roles.join(''),
    departments: departments.join(''),
    searchTerm,
    clearAllFilters,
  };

  console.log({ params });

  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/super-admin-dashboard`,
    {
      params,
      ...axiosUserServiceConfig(userToken),
    }
  );

  return {
    ...response.data,
    queryParams: {
      clearAllFilters,
      roles: roles[0]?.split(',') || [],
      departments: departments[0]?.split(',') || [],
      searchTerm,
    },
  };
};

export const getUserById = async (id: string, userToken: string) => {
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

export const getDepartment = async (id: string, userToken: string) => {
  const res = await axios.get<Department>(
    `${process.env.USER_SERVICE_URL}/department/${id}`,
    axiosUserServiceConfig(userToken)
  );
  return res.data;
};

export const updateDepartmentInformation = async (
  body: Omit<Department, 'id'>,
  id: string,
  userToken: string
) =>
  axios.patch(
    `${process.env.USER_SERVICE_URL}/department/${id}`,
    body,
    axiosUserServiceConfig(userToken)
  );

export const deleteDepartmentInformation = async (
  id: string,
  userToken: string
) =>
  axios.delete(
    `${process.env.USER_SERVICE_URL}/department/${Number(id)}`,
    axiosUserServiceConfig(userToken)
  );

export const createDepartmentInformation = async (
  body: Omit<Department, 'id'>,
  userToken: string
) =>
  axios.post(
    `${process.env.USER_SERVICE_URL}/department`,
    body,
    axiosUserServiceConfig(userToken)
  );
