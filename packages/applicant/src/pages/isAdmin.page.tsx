import { GetServerSideProps } from 'next';
import { isAdmin } from '../services/IsAdminService';
import { getUserRoles, UserRolesResponse } from '../services/UserRolesService';
import { initiateCSRFCookie } from '../utils/csrf';
import { getJwtFromCookies } from '../utils/jwt';
import { routes } from '../utils/routes';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const getRoleCheckService = () =>
  publicRuntimeConfig.oneLoginEnabled ? getUserRoles : isAdmin;

//TODO add unit test, and move this to be an api
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let result: UserRolesResponse;
  try {
    const roleCheckSevice = getRoleCheckService();
    result = await roleCheckSevice(getJwtFromCookies(req));
  } catch (error) {
    console.error('Error determining user roles');
    console.error(error);
    return {
      redirect: {
        destination: `${process.env.USER_SERVICE_URL}/register`,
        permanent: false,
      },
    };
  }
  await initiateCSRFCookie(req, res);
  if (result.isSuperAdmin)
    return {
      redirect: {
        destination: process.env.SUPER_ADMIN_FRONTEND_URL,
        permanent: false,
      },
    };
  if (result.isAdmin)
    return {
      redirect: {
        destination: process.env.ADMIN_FRONTEND_URL,
        permanent: false,
      },
    };
  if (result.isApplicant)
    return {
      redirect: {
        destination: routes.api.isNewApplicant, //checks if the user exist, if not creates it
        permanent: false,
      },
    };

  return {
    redirect: {
      destination: `${process.env.USER_SERVICE_URL}/register`,
      permanent: false,
    },
  };
};
export default function IsAdmin() {
  return <></>;
}
