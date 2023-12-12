import axios from 'axios';
import {
  hasCompletedMandatoryQuestions,
  downloadMandatoryQuestionsDueDiligenceData,
} from './MandatoryQuestionsService';

jest.mock('axios');

describe('MandatoryQuestionsService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const BASE_MANDATORY_QUESTIONS_URL =
    process.env.BACKEND_HOST + '/mandatory-questions';

  describe('downloadMandatoryQuestionsDueDiligenceData function', () => {
    it('Should return due diligence data when a valid schemeId is provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await downloadMandatoryQuestionsDueDiligenceData(
        'testSessionCookie',
        'testSchemeId',
        'true'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_MANDATORY_QUESTIONS_URL}/scheme/testSchemeId/due-diligence/?isInternal=true`,
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
