import getConfig from 'next/config';
import { axios } from '../utils/axios';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

const BASE_URL = `${BACKEND_HOST}/sessions`;

export type SessionKey = 'newScheme' | 'newQuestion' | 'updatedQuestion';

const addToSession = async (
  sessionKey: SessionKey,
  fieldKey: string,
  value: string,
  sessionCookie: string
) => {
  const config = {
    params: {
      key: `${sessionKey}.${fieldKey}`,
      value: value,
    },
    ...axiosSessionConfig(sessionCookie),
  };

  const response = await axios.patch(`${BASE_URL}/add`, {}, config);

  return {
    data: response.data,
  };
};

const addFieldsToSession = async (
  sessionKey: string,
  fields: Record<string, string | string[] | undefined>,
  sessionCookie: string
) => {
  const config = {
    params: {
      objectKey: sessionKey,
    },
    ...axiosSessionConfig(sessionCookie),
  };

  const response = await axios.patch(`${BASE_URL}/batch-add`, fields, config);

  return {
    data: response.data,
  };
};

const getValueFromSession = async (
  sessionKey: SessionKey,
  fieldKey: string,
  sessionCookie: string
) => {
  const response = await axios.get(
    `${BASE_URL}/${sessionKey}.${fieldKey}`,
    axiosSessionConfig(sessionCookie)
  );

  return response.data.sessionValue ? response.data.sessionValue : null;
};

const getSummaryFromSession = async (
  sessionKey: SessionKey,
  sessionCookie: string
): Promise<Record<string, string>> => {
  const result = await axios.get(
    `${BASE_URL}/object/${sessionKey}`,
    axiosSessionConfig(sessionCookie)
  );
  return result.data;
};

export {
  addToSession,
  addFieldsToSession,
  getValueFromSession,
  getSummaryFromSession,
};
