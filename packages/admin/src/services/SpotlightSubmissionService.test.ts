import axios from 'axios';
import getConfig from 'next/config';
import {
  GetSpotlightSubmissionDataBySchemeIdDto,
  getSpotlightSubmissionSentData,
} from './SpotlightSubmissionService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_SUBMISSION_URL = BACKEND_HOST + '/spotlight-submissions';
const SCHEME_ID = 'schemeId';
const SESSION_ID = 'SessionId';
const spotlightSubmissionSentData: GetSpotlightSubmissionDataBySchemeIdDto = {
  sentCount: 2,
  sentLastUpdatedDate: '2 September 2023',
  hasSpotlightSubmissions: true,
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('SpotlightSubmissionService', () => {
  describe('getSpotlightSubmissionSentData', () => {
    it('Should get Spotlight submission sent data', async () => {
      mockedAxios.get.mockResolvedValue({ data: spotlightSubmissionSentData });

      const response = await getSpotlightSubmissionSentData(
        SCHEME_ID,
        SESSION_ID
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/${SCHEME_ID}/get-due-diligence-data`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toEqual(spotlightSubmissionSentData);
    });
  });
});
