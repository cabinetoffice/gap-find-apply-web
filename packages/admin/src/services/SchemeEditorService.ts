import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig, getFullConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();

export type EditorList = {
  role: 'EDITOR' | 'OWNER';
  email: string;
  id: string;
};

const SCHEME_HOST = serverRuntimeConfig.backendHost + '/schemes';

export const isSchemeOwner = async (schemeId: string, sessionId: string) => {
  const { data } = await axios.get<boolean>(
    `${SCHEME_HOST}/${schemeId}/editors/isOwner`,
    axiosSessionConfig(sessionId)
  );
  return data;
};

export const getSchemeEditors = async (
  schemeId: string,
  sessionId: string,
  userServiceJwt: string
) => {
  const { data } = await axios.get<EditorList[]>(
    `${SCHEME_HOST}/${schemeId}/editors`,
    getFullConfig(sessionId, userServiceJwt)
  );
  return data;
};
