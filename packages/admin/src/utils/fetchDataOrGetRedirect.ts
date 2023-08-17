import { AxiosError } from 'axios';
import { getLoginUrl } from './general';
import { Redirect } from 'next';

async function fetchDataOrGetRedirect<T>(
  fetchData: (...args: unknown[]) => Promise<T>
): Promise<{ props: T } | { redirect: Redirect }> {
  try {
    return { props: await fetchData() };
  } catch (error: unknown) {
    return getRedirect(error);
  }
}

const getRedirect = (error: unknown) => {
  if (error instanceof AxiosError) {
    const forbidden = error?.response?.status === 403;
    if (forbidden) {
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

export { fetchDataOrGetRedirect, getRedirect };
