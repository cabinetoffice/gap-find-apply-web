import axios, { AxiosError, AxiosResponse } from 'axios';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import {
  createNewApplicationForm,
  findMatchingApplicationForms,
  getApplicationFormSection,
  getApplicationFormSummary,
  updateApplicationFormStatus,
} from './ApplicationService';
import getConfig from 'next/config';
import FindApplicationFormStatsResponse from '../types/FindApplicationFormStatsResponse';

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

describe('ApplicationService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const { serverRuntimeConfig } = getConfig();
  const BACKEND_HOST = serverRuntimeConfig.backendHost;
  const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';
  const APPLICATION_NAME = 'Test Application Name';
  const SCHEME_ID = 'a028d000004Ops2AAC';
  const APPLICATION_ID = 'a028d000004Osy3BEA';
  const SECTION_ID = 'SECTIONID';
  const SESSION_ID = 'testSessionId';

  describe('createNewApplicationForm function', () => {
    it('Should create a new application scheme', async () => {
      mockedAxios.post.mockResolvedValue({ data: { id: APPLICATION_ID } });

      const id = await createNewApplicationForm(
        SCHEME_ID,
        APPLICATION_NAME,
        SESSION_ID
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        BASE_APPLICATION_URL,
        {
          grantSchemeId: SCHEME_ID,
          applicationName: APPLICATION_NAME,
        },
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
      expect(id).toBe(APPLICATION_ID);
    });
  });

  describe('findMatchingApplicationForms function', () => {
    const mockQueryObject: ApplicationQueryObject = {
      applicationName: 'mock application form name',
    };

    const mockApplicationFormStatsArray: FindApplicationFormStatsResponse[] = [{applicationId: '1', inProgressCount: 0, submissionCount: 0}];

    it('Should send valid get request to backend', async () => {
      mockedAxios.get.mockResolvedValue(mockApplicationFormStatsArray);

      const expectedUrl = expect.stringContaining('/application-forms/find');
      const expectedParams = {
        params: { applicationName: 'mock application form name' },
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
      };

      await findMatchingApplicationForms(mockQueryObject, SESSION_ID);
      expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl, expectedParams);
    });

    it('Should return stats if no axios errors are thrown', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockApplicationFormStatsArray });

      const response = await findMatchingApplicationForms(
        mockQueryObject,
        SESSION_ID
      );
      expect(response).toStrictEqual(mockApplicationFormStatsArray);
    });

    it('Should return false if axios throws 404 error', async () => {
      const axiosErrorTest = new AxiosError();
      axiosErrorTest.response = { status: 404 } as any;

      mockedAxios.get.mockRejectedValue(axiosErrorTest);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const response = await findMatchingApplicationForms(
        mockQueryObject,
        SESSION_ID
      );

      expect(response).toStrictEqual([]);
    });
  });

  describe('getApplicationFormSummary', () => {
    it('Should fetch an application form summary with sections & questions by default', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await getApplicationFormSummary(APPLICATION_ID, SESSION_ID);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}`,
        {
          params: { withSections: true, withQuestions: true },
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });

    it('Should fetch an application form summary without sections & questions when their respective props are false', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await getApplicationFormSummary(APPLICATION_ID, SESSION_ID, false, false);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}`,
        {
          params: { withSections: false, withQuestions: false },
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('getApplicationFormSection', () => {
    it('Should call the expected endpoint to retrieve an application form section', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await getApplicationFormSection(APPLICATION_ID, SECTION_ID, SESSION_ID);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}`,
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
    });

    it('Should pas back the section data received via the REST call ', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          sectionTitle: 'Test Section Title',
        },
      });

      const response = await getApplicationFormSection(
        APPLICATION_ID,
        SECTION_ID,
        SESSION_ID
      );

      expect(response).toStrictEqual({
        sectionTitle: 'Test Section Title',
      });
    });
  });

  describe('updateApplicationFormStatus', () => {
    it('Should call the expected endpoint to update an application forms status', async () => {
      await updateApplicationFormStatus(
        APPLICATION_ID,
        'PUBLISHED',
        SESSION_ID
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}`,
        { applicationStatus: 'PUBLISHED' },
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
    });
  });
});
