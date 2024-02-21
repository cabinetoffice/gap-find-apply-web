import {
  ChangeDepartmentDto,
  SuperAdminDashboardResponse,
} from './../pages/super-admin-dashboard/types';
import axios from 'axios';
import { axiosUserServiceConfig } from '../utils/session';
import {
  Department,
  Role,
  SuperAdminDashboardFilterData,
  User,
} from '../pages/super-admin-dashboard/types';
import PaginationType from '../types/Pagination';
import { Integration } from '../pages/super-admin-dashboard/integrations/index.page';

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
    `${process.env.USER_SERVICE_URL}/super-admin-dashboard`,
    {
      params,
      ...axiosUserServiceConfig(userToken),
    }
  );
  return response.data;
};

export const checkUserIsSuperAdmin = async (userToken: string) => {
  const response = await axios.get(
    `${process.env.userServiceHost}/isSuperAdmin`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getUserById = async (id: string, userToken: string) => {
  const response = await axios.get<User>(
    `${process.env.userServiceHost}/user/${id}`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getUserFromJwt = async (userToken: string) => {
  const response = await axios.get<User>(
    `${process.env.userServiceHost}/userFromJwt`,
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
    `${process.env.userServiceHost}/page/user/${userId}/change-department`,
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
    `${process.env.userServiceHost}/user/${userId}/department`,
    changeDepartmentDto,
    {
      ...axiosUserServiceConfig(userToken),
    }
  );
};

export const getAllRoles = async (userToken: string) => {
  const response = await axios.get<Role[]>(
    `${process.env.userServiceHost}/role`,
    axiosUserServiceConfig(userToken)
  );
  return response.data;
};

export const getAllDepartments = async (userToken: string) => {
  const response = await axios.get<Department[]>(
    `${process.env.userServiceHost}/department`,
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
    connectionUrl: `${process.env.userServiceHost}/spotlight/oauth/authorize`,
  };
};

export const getIntegrations = async (
  userToken: string
): Promise<Integration[]> => {
  const spotlightIntegration = await getSpotlightIntegration(userToken);
  return [spotlightIntegration];
};
