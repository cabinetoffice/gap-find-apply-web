import React from 'react';
import { GetServerSideProps } from 'next';
import { authenticateUser } from '../services/AuthService';
import { getLoginUrl } from '../utils/general';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const cookieValue = req.cookies[process.env.JWT_COOKIE_NAME!];
  const redirectUrl = query?.redirectUrl as string | undefined;

  let response;
  try {
    response = await authenticateUser(cookieValue);
  } catch (error: any) {
    return handleError(error);
  }

  // Checks if already have authorisation headers set
  if (response.headers['set-cookie']) {
    const sessionCookie = response.headers['set-cookie'][0].split(';')[0];

    res.setHeader(
      'Set-Cookie',
      `session_id=${
        sessionCookie.split('=')[1]
      }; Path=/; secure; HttpOnly; SameSite=Lax; Max-Age=${
        process.env.MAX_COOKIE_AGE
      };`
    );
  }

  return {
    redirect: {
      destination: redirectUrl || '/dashboard',
      permanent: false,
    },
  };
};

const index = () => {
  return <div>index</div>;
};

const handleError = (error: any) => {
  console.error('Failed to verify token', error);

  if (error.response.data.error.message === 'User is not an admin') {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }
  return {
    redirect: {
      destination: getLoginUrl(),
      permanent: false,
    },
  };
};

export default index;
