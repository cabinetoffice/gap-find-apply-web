import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';
import Pagination from '../types/Pagination';

const BASE_SUBMISSIONS_URL = process.env.BACKEND_HOST + '/grant-export';

export type ExportDetails = {
  name: string;
  zipFileLocation: string;
  submissionId: string;
  status: string;
  submittedDate: string;
};

const getExportDetails = async (
  exportBatchId: string,
  grabOnlyFailed: boolean,
  pagination: Pagination,
  sessionCookie: string
) => {
  const params = { grabOnlyFailed, ...pagination };
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/${exportBatchId}/details`,
    {
      params,
      ...axiosSessionConfig(sessionCookie),
    }
  );
  return response.data;
};

const getFailedExportDetails = async (
  exportId: string,
  submissionId: string,
  sessionCookie: string
) => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/${exportId}/submissions/${submissionId}/details`,
    {
      ...axiosSessionConfig(sessionCookie),
    }
  );
  return response.data;
};

export { getExportDetails, getFailedExportDetails };
