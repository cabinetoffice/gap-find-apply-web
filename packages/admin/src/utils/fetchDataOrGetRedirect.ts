import { AxiosError } from 'axios';
import { getLoginUrl } from './general';

async function fetchDataOrGetRedirect<T>(
  fetchData: (...args: unknown[]) => Promise<T> | { redirect: object }
): Promise<ReturnType<typeof fetchData>> {
  try {
    return await fetchData();
  } catch (error: unknown) {
    return getRedirect(error);
  }
}

const getRedirect = (error: unknown) => {
  if (error instanceof AxiosError) {
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

export { fetchDataOrGetRedirect };
