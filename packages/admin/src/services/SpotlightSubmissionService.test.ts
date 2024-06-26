import getConfig from 'next/config';
import {
  GetSpotlightSubmissionDataBySchemeIdDto,
  downloadSpotlightSubmissionsDueDiligenceData,
  getSpotlightSubmissionSentData,
} from './SpotlightSubmissionService';
import { axios } from '../utils/axios';

jest.mock('../utils/axios');

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
        `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/${SCHEME_ID}/due-diligence-data`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toEqual(spotlightSubmissionSentData);
    });
  });

  describe('downloadDueDiligenceData function', () => {
    it('Should return spotlight binary data when a valid schemeId is provided and onlyValidationErrors is false', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await downloadSpotlightSubmissionsDueDiligenceData(
        'testSessionCookie',
        'testSchemeId',
        'false'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/testSchemeId/download?onlyValidationErrors=false`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
    });

    it('Should return spotlight binary data when a valid schemeId is provided and onlyValidationErrors is true', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await downloadSpotlightSubmissionsDueDiligenceData(
        'testSessionCookie',
        'testSchemeId',
        'true'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/testSchemeId/download?onlyValidationErrors=true`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
    });
  });
});
