import { AxiosError } from 'axios';
import { getLoginUrl } from './general';

const handleAxiosError = (error: AxiosError) => {
  console.error('Failed to verify token', error);
  const unauthorized =
    error?.response?.status === 401 || error.response?.status === 403;
  if (unauthorized) {
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

export { handleAxiosError };
