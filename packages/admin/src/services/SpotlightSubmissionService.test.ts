import axios from 'axios';
import getConfig from 'next/config';
import {
  getSpotlightLastUpdateDate,
  getSpotlightSubmissionCount,
} from './SpotlightSubmissionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_SUBMISSION_URL = BACKEND_HOST + '/spotlight-submissions';
const SCHEME_ID = 'schemeId';
const SESSION_ID = 'SessionId';

describe('SpotlightSubmissionService', () => {
  describe('getSpotlightSubmissionCount', () => {
    it('Should get Spotlight submission count', async () => {
      mockedAxios.get.mockResolvedValue({ data: '2' });

      const response = await getSpotlightSubmissionCount(SCHEME_ID, SESSION_ID);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_SUBMISSION_URL}/count/${SCHEME_ID}`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toEqual('2');
    });
  });

  describe('getSpotlightLastUpdateDate', () => {
    it('Should get Spotlight last updated date', async () => {
      mockedAxios.get.mockResolvedValue({ data: '2 September 2023' });

      const response = await getSpotlightLastUpdateDate(SCHEME_ID, SESSION_ID);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_SUBMISSION_URL}/last-updated/${SCHEME_ID}`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toEqual('2 September 2023');
    });
  });
});
