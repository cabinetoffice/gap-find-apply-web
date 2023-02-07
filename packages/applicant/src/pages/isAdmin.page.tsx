import { GetServerSideProps } from 'next';
import { isAdmin, IsAdminResponse } from '../services/IsAdminService';
import { initiateCSRFCookie } from '../utils/csrf';
import { getJwtFromCookies } from '../utils/jwt';
import { routes } from '../utils/routes';
//TODO add unit test, and move this to be an api
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let result: IsAdminResponse;
  try {
    result = await isAdmin(getJwtFromCookies(req));
  } catch (error) {
    console.error("Error determining if user isAdmin")
    console.error(error);
    return {
      redirect: {
        destination: '/register',
        permanent: false,
      },
    };
  }
  await initiateCSRFCookie(req, res);
  if (result.isAdmin) {
    return {
      redirect: {
        destination: process.env.ADMIN_FRONTEND_URL,
        permanent: false,
      },
    };
  }
  if (result.isApplicant) {
    return {
      redirect: {
        destination: routes.api.isNewApplicant, //checks if the user exist, if not creates it
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: '/register',
      permanent: false,
    },
  };
};
export default function IsAdmin() {
  return <></>;
}
