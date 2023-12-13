import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_SUBMISSION_URL = BACKEND_HOST + '/spotlight-submissions';

export const getSpotlightSubmissionSentData = async (
  schemeId: string,
  sessionId: string
): Promise<GetSpotlightSubmissionDataBySchemeIdDto> => {
  const { data } = await axios.get(
    `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/${schemeId}/due-diligence-data`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );
  return data;
};

export const downloadSpotlightSubmissionsDueDiligenceData = async (
  sessionCookie: string,
  schemeId: string,
  onlyValidationErrors: string
) => {
  const response = await axios.get(
    `${BASE_SPOTLIGHT_SUBMISSION_URL}/scheme/${schemeId}/download?onlyValidationErrors=${onlyValidationErrors}`,
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

export interface GetSpotlightSubmissionDataBySchemeIdDto {
  sentCount: number;
  sentLastUpdatedDate: string;
  hasSpotlightSubmissions: boolean;
}
