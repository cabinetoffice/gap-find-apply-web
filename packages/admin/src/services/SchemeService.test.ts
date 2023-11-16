import axios from 'axios';
import getConfig from 'next/config';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import Pagination from '../types/Pagination';
import { findMatchingApplicationForms } from './ApplicationService';
import {
  createNewScheme,
  findApplicationFormFromScheme,
  getGrantScheme,
  getUserSchemes,
  patchScheme,
  schemeApplicationIsInternal,
} from './SchemeService';
import { axiosSessionConfig } from '../utils/session';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});

jest.mock('axios');
jest.mock('../services/ApplicationService');

describe('SchemeService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const { serverRuntimeConfig } = getConfig();
  const BACKEND_HOST = serverRuntimeConfig.backendHost;
  const BASE_SCHEME_URL = BACKEND_HOST + '/schemes';

  const mockSchemes = [
    {
      name: 'name-1',
      schemeId: 'schemeId-1',
      ggisReference: 'ggisReference-1',
      organisationId: 'organisationId-1',
    },
    {
      name: 'name-2',
      schemeId: 'schemeId-2',
      ggisReference: 'ggisReference-2',
      organisationId: 'organisationId-2',
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserSchemes function', () => {
    it('Should return a list of organisation schemes', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSchemes });

      const result = await getUserSchemes({ paginate: false }, 'testSessionId');

      expect(mockedAxios.get).toHaveBeenCalledWith(BASE_SCHEME_URL, {
        params: { paginate: false },
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
      });
      expect(result).toStrictEqual(mockSchemes);
    });

    it('Should return a list of organisation schemes with a limit', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSchemes });
      const paginationParams: Pagination = {
        paginate: true,
        page: 0,
        size: 2,
        sort: 'createdDate,DESC',
      };

      const result = await getUserSchemes(paginationParams, 'testSessionId');

      expect(mockedAxios.get).toHaveBeenCalledWith(BASE_SCHEME_URL, {
        params: paginationParams,
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
      });
      expect(result).toStrictEqual(mockSchemes);
    });
  });

  describe('createNewScheme function', () => {
    it('Should create a new grant scheme', () => {
      const mockPost = jest.fn();
      mockedAxios.post.mockImplementation(mockPost);

      createNewScheme('testSessionId', 'mockSchemeName', 'mockGGiSReference');

      expect(mockPost).toHaveBeenCalledWith(
        BASE_SCHEME_URL,
        {
          name: 'mockSchemeName',
          ggisReference: 'mockGGiSReference',
        },
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('findApplicationFormFromScheme function', () => {
    const mockedFindMatchingApplicationForms =
      findMatchingApplicationForms as jest.MockedFn<
        typeof findMatchingApplicationForms
      >;

    it('Should call application service with query to check with scheme id', async () => {
      mockedFindMatchingApplicationForms.mockResolvedValue([]);
      const expectedQueryForCheckWithSchemeId: ApplicationQueryObject = {
        grantSchemeId: 'mockSchemeId',
      };
      await findApplicationFormFromScheme('mockSchemeId', 'testSessionId');

      expect(mockedFindMatchingApplicationForms).toHaveBeenCalledWith(
        expectedQueryForCheckWithSchemeId,
        'testSessionId'
      );
    });

    it('Should return the result of application service method', async () => {
      mockedFindMatchingApplicationForms.mockResolvedValue(['mock-app-id']);

      const response = await findApplicationFormFromScheme(
        'mockSchemeId',
        'testSessionid'
      );

      expect(response).toStrictEqual(['mock-app-id']);
    });
  });

  describe('getGrantScheme function', () => {
    it('Should return an object with scheme', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSchemes[0] });

      const result = await getGrantScheme('someId', 'testSessionId');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SCHEME_URL}/someId`,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
      expect(result).toStrictEqual(mockSchemes[0]);
    });
  });

  describe('patchScheme function', () => {
    it('Should update an existing scheme', () => {
      const mockPatch = jest.fn();
      mockedAxios.patch.mockImplementation(mockPatch);

      patchScheme(
        'someId',
        { ggisReference: 'mockGGiSReference2' },
        'testSessionId'
      );

      expect(mockPatch).toHaveBeenCalledWith(
        `${BASE_SCHEME_URL}/someId`,
        {
          ggisReference: 'mockGGiSReference2',
        },
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('schemeApplicationIsInternal', () => {
    it('should return false when the scheme does not have an internal application form', async () => {
      const schemeId = 'schemeId';
      const sessionId = 'sessionId';
      const expected = false;
      const axiosGetMock = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: expected });

      const result = await schemeApplicationIsInternal(schemeId, sessionId);

      expect(axiosGetMock).toHaveBeenCalledWith(
        `${BASE_SCHEME_URL}/${schemeId}/hasInternalApplicationForm`,
        axiosSessionConfig(sessionId)
      );
      expect(result).toBe(expected);

      axiosGetMock.mockRestore();
    });

    it('should return true when the scheme does have an internal application form', async () => {
      const schemeId = 'schemeId';
      const sessionId = 'sessionId';
      const expected = true;
      const axiosGetMock = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: expected });

      const result = await schemeApplicationIsInternal(schemeId, sessionId);

      expect(axiosGetMock).toHaveBeenCalledWith(
        `${BASE_SCHEME_URL}/${schemeId}/hasInternalApplicationForm`,
        axiosSessionConfig(sessionId)
      );
      expect(result).toBe(expected);

      axiosGetMock.mockRestore();
    });
  });
});
