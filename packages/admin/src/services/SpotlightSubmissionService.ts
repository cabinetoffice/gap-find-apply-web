import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_SUBMISSION_URL = BACKEND_HOST + '/spotlight-submissions';

export const getSpotlightSubmissionCount = async (
  schemeId: string,
  sessionId: string
) => {
  const response = await axios.get(
    `${BASE_SPOTLIGHT_SUBMISSION_URL}/count/${schemeId}`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );

  return response.data;
};

export const getSpotlightLastUpdateDate = async (
  schemeId: string,
  sessionId: string
) => {
  const response = await axios.get(
    `${BASE_SPOTLIGHT_SUBMISSION_URL}/last-updated/${schemeId}`,
    {
      ...axiosSessionConfig(sessionId),
    }
  );

  return response.data;
};
