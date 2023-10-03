import { GetServerSideProps } from 'next';
import { isAdmin } from '../services/IsAdminService';
import { getUserRoles, UserRolesResponse } from '../services/UserRolesService';
import { initiateCSRFCookie } from '../utils/csrf';
import { getJwtFromCookies } from '../utils/jwt';
import { routes } from '../utils/routes';
import getConfig from 'next/config';

const getRoleCheckService = (publicRuntimeConfig) =>
  publicRuntimeConfig.oneLoginEnabled ? getUserRoles : isAdmin;

const getDestination = (
  user: UserRolesResponse,
  publicRuntimeConfig,
  applyMigrationStatus?: string,
  findMigrationStatus?: string
) => {
  if (user.isSuperAdmin)
    return `${process.env.ADMIN_FRONTEND_URL}/?redirectUrl=/super-admin-dashboard`;
  if (user.isAdmin)
    return `${process.env.ADMIN_FRONTEND_URL}/?redirectUrl=/dashboard`;
  if (user.isApplicant)
    return routes.api.isNewApplicant.index(
      applyMigrationStatus,
      findMigrationStatus
    ); //checks if the user exist, if not creates it
  // TODO go to an error page?
  return `${publicRuntimeConfig.FIND_A_GRANT_URL}`;
};

//TODO add unit test, and move this to be an api
export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const { publicRuntimeConfig } = getConfig();
  let result: UserRolesResponse;
  try {
    const userServiceJwt = getJwtFromCookies(req);
    const roleCheckService = getRoleCheckService(publicRuntimeConfig);
    result = await roleCheckService(userServiceJwt);
  } catch (error) {
    console.error('Error determining user roles');
    console.error(error);
    return {
      redirect: {
        destination: publicRuntimeConfig.oneLoginEnabled
          ? process.env.HOST
          : `${process.env.USER_SERVICE_URL}/register`,
        permanent: false,
      },
    };
  }
  await initiateCSRFCookie(req, res);

  const destination = getDestination(
    result,
    publicRuntimeConfig,
    query?.applyMigrationStatus as string,
    query?.findMigrationStatus as string
  );
  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
};
export default function IsAdmin() {
  return <></>;
}
