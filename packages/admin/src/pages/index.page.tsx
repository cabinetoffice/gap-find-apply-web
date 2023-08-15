import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { authenticateUser } from '../services/AuthService';
import { getLoginUrl } from '../utils/general';
import { AxiosError } from 'axios';
import { fetchData } from '../utils/fetchData';

export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const cookieValue = req.cookies[process.env.JWT_COOKIE_NAME!];
  const redirectUrl = query?.redirectUrl as string | undefined;

  const getPageData = async () => authenticateUser(cookieValue);
  const response = await fetchData(getPageData);

  if ('redirect' in response) {
    return response;
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
