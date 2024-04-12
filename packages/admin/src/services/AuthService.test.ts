import { authenticateUser, logoutUser } from './AuthService';
import getConfig from 'next/config';
import { axios } from '../utils/axios';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});

jest.mock('../utils/axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST;
const JWT_TOKEN = 'TestJwt';

describe('AuthService', () => {
  it.skip("Should authenticate user's JWT token", async () => {
    mockedAxios.post.mockResolvedValue({});

    await authenticateUser(JWT_TOKEN);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${BASE_APPLICATION_URL}/login`,
      {},
      {
        headers: { Authorization: 'Bearer TestJwt' },
      }
    );
  });

  it('Should clear back-end authentication session cookie', async () => {
    mockedAxios.delete.mockResolvedValue({});

    await logoutUser('testSessionId');

    expect(mockedAxios.delete).toHaveBeenNthCalledWith(
      1,
      `${BASE_APPLICATION_URL}/logout`,
      { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
    );
  });
});
