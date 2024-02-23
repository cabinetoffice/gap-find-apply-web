import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_SUBMISSIONS_URL = process.env.BACKEND_HOST + '/grant-export';

const getExportDetails = async (
  sessionCookie: string,
  exportBatchId: string
) => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/${exportBatchId}/details`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

export { getExportDetails };
