import { AxiosError } from 'axios';
import { getLoginUrl } from './general';

async function fetchData<T>(
  fetchData: (...args: any[]) => Promise<T> | { redirect: object }
): Promise<ReturnType<typeof fetchData>> {
  try {
    return await fetchData();
  } catch (error: unknown) {
    return handleRequestError(error);
  }
}

const handleRequestError = (error: unknown) => {
  if (error instanceof AxiosError) {
    console.error('Request error', error);
    const unauthorized =
      error?.response?.status === 401 || error?.response?.status === 403;
    if (unauthorized) {
      return {
        redirect: {
          destination: '/404',
          permanent: false,
        },
      };
    }
  }
  return {
    redirect: {
      destination: getLoginUrl(),
      permanent: false,
    },
  };
};

export { fetchData };
