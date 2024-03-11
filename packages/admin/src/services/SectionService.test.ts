import axios from 'axios';
import {
  deleteSection,
  postSection,
  updateSectionStatus,
  updateSectionTitle,
} from './SectionService';
import getConfig from 'next/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';
const APPLICATION_ID = 'TestApp';
const SECTION_ID = 'SectionId';
const SESSION_ID = 'SessionId';
const VERSION = '1';

describe('SectionService', () => {
  describe('postSection', () => {
    it('Should add a new section', async () => {
      mockedAxios.post.mockResolvedValue({ data: { id: 'testSectionId' } });

      const response = await postSection(SESSION_ID, APPLICATION_ID, {
        sectionTitle: 'New Section Name',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections`,
        {
          sectionTitle: 'New Section Name',
        },
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
      expect(response).toStrictEqual('testSectionId');
    });
  });

  describe('deleteSection', () => {
    it('Should delete a section', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await deleteSection(SESSION_ID, APPLICATION_ID, SECTION_ID, VERSION);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/${VERSION}`,
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
    });
  });

  describe('updateSection', () => {
    beforeEach(() => {
      mockedAxios.patch.mockResolvedValue({});
    });

    it('should update section title', async () => {
      await updateSectionTitle({
        sessionId: SESSION_ID,
        applicationId: APPLICATION_ID,
        sectionId: SECTION_ID,
        body: {
          sectionTitle: 'New Title',
          version: '1',
        },
      });
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/title`,
        { sectionTitle: 'New Title', version: '1' },
        { headers: { Cookie: 'SESSION=SessionId;' }, withCredentials: true }
      );
    });

    it('should update section status', async () => {
      await updateSectionStatus(
        SESSION_ID,
        APPLICATION_ID,
        SECTION_ID,
        'COMPLETE'
      );
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}`,
        'COMPLETE',
        {
          headers: {
            Cookie: 'SESSION=SessionId;',
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
    });
  });
});
