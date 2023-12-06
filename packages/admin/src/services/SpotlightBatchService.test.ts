import axios from 'axios';
import getConfig from 'next/config';
import {
  getSpotlightErrors,
  getSpotlightValidationErrorSubmissions,
} from './SpotlightBatchService';
import { SpotlightError } from '../types/SpotlightError';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_BATCH_URL = BACKEND_HOST + '/spotlight-batch';
const SCHEME_ID = 'schemeId';
const SESSION_ID = 'SessionId';
const spotlightErrors = {
  errorCount: 0,
  errorStatus: 'API',
  errorFound: false,
} as SpotlightError;

describe('SpotlightBatchService', () => {
  describe('getSpotlightErrors', () => {
    it('Should get Spotlight errors', async () => {
      mockedAxios.get.mockResolvedValue({ data: spotlightErrors });

      const response = await getSpotlightErrors(SCHEME_ID, SESSION_ID);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_BATCH_URL}/get-spotlight-scheme-errors/${SCHEME_ID}`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toEqual(spotlightErrors);
    });
  });

  describe('getSpotlightValidationErrorSubmissions', () => {
    it('Should get Spotlight submissions with validation errors', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'some binary data' });

      const response = await getSpotlightValidationErrorSubmissions(
        SESSION_ID,
        SCHEME_ID
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SPOTLIGHT_BATCH_URL}/get-validation-error-files/${SCHEME_ID}`,
        {
          headers: { Cookie: 'SESSION=SessionId;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
      expect(response).toEqual({ data: 'some binary data' });
    });
  });
});
