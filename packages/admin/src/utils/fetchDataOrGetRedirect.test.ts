import { getLoginUrl } from './general';
import { fetchDataOrGetRedirect } from './fetchDataOrGetRedirect';
import { AxiosError, AxiosResponse } from 'axios';

describe('fetchDataOrGetRedirect()', () => {
  const mockFetchFunctionSuccess = async () => 'Success';
  const mockFetchFunctionUnauthorizedError = async () => {
    const error = new AxiosError('Unauthorized');
    error.response = {
      ...error.response,
      status: 401,
      statusText: 'Unauthorized',
    } as AxiosResponse;
    throw error;
  };

  it('should return data from fetchFunction on success', async () => {
    const result = await fetchDataOrGetRedirect(mockFetchFunctionSuccess);
    expect(result).toBe('Success');
  });

  it('should handle AxiosError and return redirect object for unauthorized error', async () => {
    const result = await fetchDataOrGetRedirect(
      mockFetchFunctionUnauthorizedError
    );
    expect(result).toEqual({
      redirect: {
        destination: '/404',
        permanent: false,
      },
    });
  });

  it('should handle unknown error and return redirect object to login', async () => {
    const unknownError = new Error('Some other error');
    const mockFetchFunctionUnknownError = async () => {
      throw unknownError;
    };

    const result = await fetchDataOrGetRedirect(mockFetchFunctionUnknownError);
    expect(result).toEqual({
      redirect: {
        destination: getLoginUrl(),
        permanent: false,
      },
    });
  });
});
