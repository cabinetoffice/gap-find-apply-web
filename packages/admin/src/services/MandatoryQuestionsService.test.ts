import axios from 'axios';
import {
  completedMandatoryQuestions,
  spotlightExport,
} from './MandatoryQuestionsService';

jest.mock('axios');

describe('SubmissionsService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const BASE_SUBMISSIONS_URL =
    process.env.BACKEND_HOST + '/mandatory-questions';

  describe('spotlightExport function', () => {
    it('Should return spotlight binary data when a valid schemeId is provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await spotlightExport('testSessionCookie', 'testSchemeId');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/spotlight-export/testSchemeId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
    });
  });

  describe('completedMandatoryQuestions function', () => {
    it('Should return true if a scheme has completed mandatory questions', async () => {
      mockedAxios.get.mockResolvedValue({ data: true });

      const response = await completedMandatoryQuestions(
        'testSchemeId',
        'testSessionCookie'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/does-scheme-have-completed-mandatory-questions/testSchemeId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );
      expect(response).toBeTruthy();
    });

    it('Should return false if a scheme has no completed mandatory questions', async () => {
      mockedAxios.get.mockResolvedValue({ data: false });

      const response = await completedMandatoryQuestions(
        'testSchemeId',
        'testSessionCookie'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/does-scheme-have-completed-mandatory-questions/testSchemeId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );
      expect(response).toBeFalsy();
    });
  });
});
