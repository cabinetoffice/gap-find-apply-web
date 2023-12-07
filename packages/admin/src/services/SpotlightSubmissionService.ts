import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_SUBMISSION_URL = BACKEND_HOST + '/spotlight-submissions';

export const getSpotlightSubmissionSentData = async (
  schemeId: string,
  sessionId: string
): Promise<GetSpotlightSubmissionSentData> => {
  const { data } = await axios.get(
    `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/${schemeId}/get-sent-data`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );
  return data;
};
export interface GetSpotlightSubmissionSentData {
  count: number;
  lastUpdatedDate: string;
}
