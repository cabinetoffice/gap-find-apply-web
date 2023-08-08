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
  } catch (error) {
    console.error('Failed to verify token', error);
    return {
      redirect: {
        destination: getLoginUrl(),
        permanent: false,
      },
    };
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

export default index;
