import ExportStatusEnum from '../enums/ExportStatus';
import { axios } from '../utils/axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_SUBMISSIONS_URL = process.env.BACKEND_HOST + '/submissions';

const spotlightExport = async (
  sessionCookie: string,
  applicationId: string
) => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/spotlight-export/${applicationId}`,
    {
      withCredentials: true,
      responseType: 'arraybuffer',
      headers: {
        Cookie: `SESSION=${sessionCookie};`,
      },
    }
  );
  return response;
};

const getApplicationExportStatus = async (
  sessionCookie: string,
  applicationId: string
) => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/status/${applicationId}`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data as ExportStatusEnum;
};

const requestSubmissionsExport = async (
  sessionCookie: string,
  applicationId: string
) => {
  await axios.post(
    `${BASE_SUBMISSIONS_URL}/export-all/${applicationId}`,
    null,
    axiosSessionConfig(sessionCookie)
  );
};

const getCompletedSubmissionExportList = async (
  sessionCookie: string,
  exportId: string
): Promise<{ label: string; s3key: string }[]> => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/exports/${exportId}`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

const createPresignedUrl = async (sessionCookie: string, s3Key: string) => {
  const response = await axios.post(
    `${BASE_SUBMISSIONS_URL}/signed-url`,
    {
      s3ObjectKey: s3Key,
    },
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

export {
  spotlightExport,
  getApplicationExportStatus,
  requestSubmissionsExport,
  getCompletedSubmissionExportList,
  createPresignedUrl,
};
