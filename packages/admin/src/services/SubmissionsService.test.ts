import axios from 'axios';
import ExportStatusEnum from '../enums/ExportStatus';
import {
  getApplicationExportStatus,
  spotlightExport,
  requestSubmissionsExport,
  getCompletedSubmissionExportList,
} from './SubmissionsService';

jest.mock('axios');

describe('SubmissionsService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const BASE_SUBMISSIONS_URL = process.env.BACKEND_HOST + '/submissions';

  describe('spotlightExport function', () => {
    it('Should return spotlight binary data when a valid applicationId is provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: 'Some binary data' });

      await spotlightExport('testSessionCookie', 'testApplicationId');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/spotlight-export/testApplicationId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          responseType: 'arraybuffer',
          withCredentials: true,
        }
      );
    });
  });

  describe('getApplicationExportStatus function', () => {
    it('Should return an export status valid applicationId is provided', async () => {
      mockedAxios.get.mockResolvedValue({
        data: ExportStatusEnum.NOT_STARTED,
      });

      const response = await getApplicationExportStatus(
        'testSessionCookie',
        'testApplicationId'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/status/testApplicationId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );

      expect(response).toStrictEqual(ExportStatusEnum.NOT_STARTED);
    });
  });

  describe('requestSubmissionsExport function', () => {
    it('Should call axios with correct parameters when a valid applicationId is provided', async () => {
      mockedAxios.post.mockResolvedValue({});

      const response = await requestSubmissionsExport(
        'testSessionCookie',
        'testApplicationId'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/export-all/testApplicationId`,
        null,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('getCompletedSubmissionExportList function', () => {
    it('Should return an array of objects with label and url', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [{ label: 'File name', url: 'http://testFileLink.com' }],
      });

      const result = await getCompletedSubmissionExportList(
        'testSessionCookie',
        'testExportId'
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_SUBMISSIONS_URL}/exports/testExportId`,
        {
          headers: { Cookie: 'SESSION=testSessionCookie;' },
          withCredentials: true,
        }
      );
      expect(result).toStrictEqual([
        { label: 'File name', url: 'http://testFileLink.com' },
      ]);
    });
  });
});
