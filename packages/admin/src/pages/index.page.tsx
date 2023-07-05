import React from 'react';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { authenticateUser } from '../services/AuthService';
import { getLoginUrl } from '../utils/general';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const cookieValue = req.cookies[process.env.JWT_COOKIE_NAME!];

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

  // Checks if already have athorisation headers set
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
      destination: '/dashboard',
      permanent: false,
    },
  };
};

const index = () => {
  return <div>index</div>;
};

export default index;
