import axios from 'axios';
import getConfig from 'next/config';
import { SpotlightError } from '../types/SpotlightError';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SPOTLIGHT_BATCH_URL = BACKEND_HOST + '/spotlight-batch';

export const getSpotlightErrors = async (
  schemeId: string,
  sessionId: string
) => {
  console.info(
    `Making request for url: ${BASE_SPOTLIGHT_BATCH_URL}/scheme/${schemeId}/spotlight/get-errors`
  );

  const response = await axios.get(
    `${BASE_SPOTLIGHT_BATCH_URL}/scheme/${schemeId}/spotlight-errors`,
    axiosSessionConfig(sessionId)
  );

  return response.data as SpotlightError;
};
