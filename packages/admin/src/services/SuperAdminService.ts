import {
  ChangeDepartmentDto,
  SuperAdminDashboardResponse,
} from './../pages/super-admin-dashboard/types';
import getConfig from 'next/config';
import { axios } from '../utils/axios';
import { axiosUserServiceConfig } from '../utils/session';
import {
  Department,
  Role,
  SuperAdminDashboardFilterData,
  User,
} from '../pages/super-admin-dashboard/types';
import PaginationType from '../types/Pagination';
import { Integration } from '../pages/super-admin-dashboard/integrations/index.page';

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
  filterData: { roles = '', departments = '', searchTerm = '' },
}: GetSuperAdminDashboardParams): Promise<SuperAdminDashboardResponse> => {
  const params = {
    ...pagination,
    roles,
    departments,
    searchTerm,
  };

  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/super-admin-dashboard`,
    {
      params,
      ...axiosUserServiceConfig(userToken),
    }
  );
  return response.data;
};

export const checkUserIsSuperAdmin = async (userToken: string) => {
  const response = await axios.get(
    `${serverRuntimeConfig.userServiceHost}/isSuperAdmin`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getUserById = async (id: string, userToken: string) => {
  const response = await axios.get<User>(
    `${serverRuntimeConfig.userServiceHost}/user/${id}`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getUserFromJwt = async (userToken: string) => {
  const response = await axios.get<User>(
    `${serverRuntimeConfig.userServiceHost}/userFromJwt`,
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
  departmentId: number,
  userToken: string
) => {
  const changeDepartmentDto: ChangeDepartmentDto = {
    departmentId: departmentId,
  };
  await axios.patch(
    `${serverRuntimeConfig.userServiceHost}/user/${userId}/department`,
    changeDepartmentDto,
    {
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
  userToken: string,
  departmentId?: number
) => {
  const body =
    typeof newUserRoles === 'string'
      ? { departmentId, newUserRoles: [newUserRoles] }
      : { departmentId, newUserRoles };

  await axios.patch(
    `${process.env.USER_SERVICE_URL}/user/${id}/role`,
    body,
    axiosUserServiceConfig(userToken)
  );
};

export const deleteUserInformation = async (id: string, userToken: string) => {
  await axios.delete(
    `${process.env.USER_SERVICE_URL}/user/${id}`,
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

type UserServiceIntegrationResponse = Omit<Integration, 'connectionUrl'>;

const getSpotlightIntegration = async (userToken: string) => {
  const integration = await axios.get<UserServiceIntegrationResponse>(
    `${process.env.USER_SERVICE_URL}/spotlight/integration`,
    axiosUserServiceConfig(userToken)
  );
  return {
    ...integration.data,
    connectionUrl: `${serverRuntimeConfig.userServiceHost}/spotlight/oauth/authorize`,
  };
};

export const getIntegrations = async (
  userToken: string
): Promise<Integration[]> => {
  const spotlightIntegration = await getSpotlightIntegration(userToken);
  return [spotlightIntegration];
};
