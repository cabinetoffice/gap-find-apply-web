import { AxiosError } from 'axios';
import getConfig from 'next/config';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import FindApplicationFormStatsResponse from '../types/FindApplicationFormStatsResponse';
import {
  createNewApplicationForm,
  downloadSummary,
  findMatchingApplicationForms,
  getApplicationFormSection,
  getApplicationFormSummary,
  getApplicationStatus,
  getLastEditedEmail,
  handleQuestionOrdering,
  handleSectionOrdering,
  updateApplicationFormStatus,
} from './ApplicationService';
import { decrypt } from '../utils/encryption';
import { axios } from '../utils/axios';

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
jest.mock('../utils/axios');

jest.mock('../utils/encryption', () => ({
  decrypt: jest.fn(),
}));

describe('ApplicationService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const { serverRuntimeConfig } = getConfig();
  const BACKEND_HOST = serverRuntimeConfig.backendHost;
  const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';
  const APPLICATION_NAME = 'Test Application Name';
  const SCHEME_ID = 'a028d000004Ops2AAC';
  const APPLICATION_ID = 'a028d000004Osy3BEA';
  const SECTION_ID = 'SECTIONID';
  const QUESTION_ID = 'QUESTIONID';
  const SESSION_ID = 'testSessionId';
  const VERSION = '1';

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

    const mockApplicationFormStatsArray: FindApplicationFormStatsResponse[] = [
      { applicationId: '1', inProgressCount: 0, submissionCount: 0 },
    ];

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
      mockedAxios.get.mockResolvedValue({
        data: mockApplicationFormStatsArray,
      });

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

  describe('handleSectionOrdering', () => {
    it('Should call the expected endpoint to update an application forms section order', async () => {
      const increment = 1;
      await handleSectionOrdering(
        increment,
        SECTION_ID,
        APPLICATION_ID,
        SESSION_ID,
        VERSION
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/order`,
        { increment, sectionId: SECTION_ID, version: VERSION },
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleQuestionOrdering', () => {
    it('Should call the expected endpoint to update an application forms section order', async () => {
      const increment = 1;
      const version = 1;
      await handleQuestionOrdering({
        increment,
        questionId: QUESTION_ID,
        sectionId: SECTION_ID,
        applicationId: APPLICATION_ID,
        sessionId: SESSION_ID,
        version,
      });

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/questions/${QUESTION_ID}/order/${increment}?version=${version}`,
        {},
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLastUpdatedEmail', () => {
    it('Should call the expected endpoint to retrieve the last updated email', async () => {
      const grantApplicationId = 'a028d000004Osy3BEA';
      const sessionCookie = 'testSessionId';

      mockedAxios.get.mockResolvedValue({
        data: { encryptedEmail: 'test@test.gov' },
      });

      await getLastEditedEmail(grantApplicationId, sessionCookie);

      expect(decrypt).toHaveBeenCalledWith('test@test.gov');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${grantApplicationId}/lastUpdated/email`,
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
    });
  });

  describe('getApplicationStatus', () => {
    it('Should call the expected endpoint to retrieve the application form status', async () => {
      const grantApplicationId = 'a028d000004Osy3BEA';
      const sessionCookie = 'testSessionId';

      mockedAxios.get.mockResolvedValue({
        data: { status: 'PUBLISHED' },
      });

      await getApplicationStatus(grantApplicationId, sessionCookie);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${grantApplicationId}/status`,
        { headers: { Cookie: 'SESSION=testSessionId;' }, withCredentials: true }
      );
    });
  });

  describe('downloadSummary', () => {
    it('Should call the expected endpoint to download the summary', async () => {
      const grantApplicationId = 'a028d000004Osy3BEA';
      const sessionCookie = 'testSessionId';

      mockedAxios.get.mockResolvedValue({});

      await downloadSummary(grantApplicationId, sessionCookie);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${grantApplicationId}/download-summary`,
        {
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
          responseType: 'arraybuffer',
        }
      );
    });
  });
});
