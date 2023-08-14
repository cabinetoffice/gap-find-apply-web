import { AxiosError } from 'axios';

const handleServiceError = (err: AxiosError) => {
  if (err?.response?.status === 403) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }
};

export { handleServiceError };
