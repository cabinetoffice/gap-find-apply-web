import axios from 'axios';
import getConfig from 'next/config';
import { SpotlightError } from '../types/SpotlightError';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_BATCH_URL = BACKEND_HOST + '/spotlight-batch';
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

export const getSpotlightErrors = async (
  schemeId: string,
  sessionId: string
) => {
  console.log(
    `Making request for url: ${BASE_SPOTLIGHT_BATCH_URL}/get-spotlight-scheme-errors/${schemeId}`
  );

  const response = await axios.get(
    `${BASE_SPOTLIGHT_BATCH_URL}/get-spotlight-scheme-errors/${schemeId}`,
    axiosSessionConfig(sessionId)
  );

  return response.data as SpotlightError;
};

export const getSpotlightValidationErrorSubmissions = async (
  sessionCookie: string,
  schemeId: string
) => {
  const response = await axios.get(
    `${BASE_SPOTLIGHT_BATCH_URL}/get-validation-error-files/${schemeId}`,
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
