import axios from 'axios';
import { deleteSection, postSection } from './SectionService';
import getConfig from 'next/config';
import { schemeApplicationIsInternal } from './SchemeService';
import { axiosSessionConfig } from '../utils/session';

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
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';
const BASE_SCHEMES_URL = BACKEND_HOST + '/schemes';
const APPLICATION_ID = 'TestApp';
const SECTION_ID = 'SectionId';
const SESSION_ID = 'SessionId';

describe('SectionService', () => {
  describe('postSection', () => {
    it('Should add a new section', async () => {
      mockedAxios.patch.mockResolvedValue({});

      await postSection(SESSION_ID, APPLICATION_ID, {
        sectionTitle: 'New Section Name',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections`,
        {
          sectionTitle: 'New Section Name',
        },
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
    });
  });

  describe('deleteSection', () => {
    it('Should delete a section', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await deleteSection(SESSION_ID, APPLICATION_ID, SECTION_ID);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
    });
  });

  describe('schemeApplicationIsInternal', () => {
    it('should return false when the scheme does not have an internal application form', async () => {
      const schemeId = 'schemeId';
      const sessionId = 'sessionId';
      const expected = false;
      const axiosGetMock = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: expected });

      const result = await schemeApplicationIsInternal(schemeId, sessionId);

      expect(axiosGetMock).toHaveBeenCalledWith(
        `${BASE_SCHEMES_URL}/${schemeId}/hasInternalApplicationForm`,
        axiosSessionConfig(sessionId)
      );
      expect(result).toBe(expected);

      axiosGetMock.mockRestore();
    });

    it('should return true when the scheme does have an internal application form', async () => {
      const schemeId = 'schemeId';
      const sessionId = 'sessionId';
      const expected = true;
      const axiosGetMock = jest
        .spyOn(axios, 'get')
        .mockResolvedValue({ data: expected });

      const result = await schemeApplicationIsInternal(schemeId, sessionId);

      expect(axiosGetMock).toHaveBeenCalledWith(
        `${BASE_SCHEMES_URL}/${schemeId}/hasInternalApplicationForm`,
        axiosSessionConfig(sessionId)
      );
      expect(result).toBe(expected);

      axiosGetMock.mockRestore();
    });

    it('should throw an error when the schemeId is empty', async () => {
      const schemeId = '';
      const sessionId = 'sessionId';

      await expect(
        schemeApplicationIsInternal(schemeId, sessionId)
      ).rejects.toThrow(Error);
    });

    it('should throw an error when the sessionId is empty', async () => {
      const schemeId = 'schemeId';
      const sessionId = '';

      await expect(
        schemeApplicationIsInternal(schemeId, sessionId)
      ).rejects.toThrow(Error);
    });
  });
});
