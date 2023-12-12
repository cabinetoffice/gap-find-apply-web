import axios from 'axios';
import getConfig from 'next/config';
import { getSpotlightErrors } from './SpotlightBatchService';
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
        `${BASE_SPOTLIGHT_BATCH_URL}/scheme/${SCHEME_ID}/spotlight/get-errors`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toEqual(spotlightErrors);
    });
  });
});
