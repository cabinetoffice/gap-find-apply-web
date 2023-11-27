import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SCHEME_URL = BACKEND_HOST + '/spotlight-batch';

export const getSpotlightErrors = async (
  schemeId: string,
  sessionId: string
) => {
  console.log(
    `Making request for url: ${BASE_SCHEME_URL}/get-spotlight-scheme-errors/${schemeId}`
  );

  const response = await axios.get(
    `${BASE_SCHEME_URL}/get-spotlight-scheme-errors/${schemeId}`,
    axiosSessionConfig(sessionId)
  );

  return response.data as SpotlightError;
};
