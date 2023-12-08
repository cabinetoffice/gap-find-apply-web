import axios from 'axios';
import {
  hasCompletedMandatoryQuestions,
  downloadDueDiligenceData,
  spotlightExport,
} from './MandatoryQuestionsService';

jest.mock('axios');

describe('MandatoryQuestionsService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const BASE_MANDATORY_QUESTIONS_URL =
    process.env.BACKEND_HOST + '/mandatory-questions';

  describe('downloadDueDiligenceData function', () => {
    it('Should return due diligence data when a valid schemeId is provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await downloadDueDiligenceData(
        'testSessionCookie',
        'testSchemeId',
        'true'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_MANDATORY_QUESTIONS_URL}/due-diligence/testSchemeId?isInternal=true`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
    });
  });

  describe('spotlightExport function', () => {
    it('Should return spotlight binary data when a valid schemeId is provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await spotlightExport('testSessionCookie', 'testSchemeId');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_MANDATORY_QUESTIONS_URL}/spotlight-export/testSchemeId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
    });
  });

  describe('hasCompletedMandatoryQuestions function', () => {
    it('Should return true if a scheme has completed mandatory questions', async () => {
      mockedAxios.get.mockResolvedValue({ data: true });

      const response = await hasCompletedMandatoryQuestions(
        'testSchemeId',
        'testSessionCookie',
        true
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_MANDATORY_QUESTIONS_URL}/scheme/testSchemeId/isCompleted?isInternal=true`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );
      expect(response).toBeTruthy();
    });

    it('Should return false if a scheme has no completed mandatory questions', async () => {
      mockedAxios.get.mockResolvedValue({ data: false });

      const response = await hasCompletedMandatoryQuestions(
        'testSchemeId',
        'testSessionCookie',
        true
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_MANDATORY_QUESTIONS_URL}/scheme/testSchemeId/isCompleted?isInternal=true`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );
      expect(response).toBeFalsy();
    });
  });
});
