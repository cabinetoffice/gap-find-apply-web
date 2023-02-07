import axios from 'axios';
import getConfig from 'next/config';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import Pagination from '../types/Pagination';
import Scheme from '../types/Scheme';
import { axiosSessionConfig } from '../utils/session';
import { findMatchingApplicationForms } from './ApplicationService';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SCHEME_URL = BACKEND_HOST + '/schemes';

const getUserSchemes = async (pagination: Pagination, sessionId: string) => {
  const response = await axios.get(`${BASE_SCHEME_URL}`, {
    params: pagination,
    ...axiosSessionConfig(sessionId),
  });

  return response.data;
};

const createNewScheme = async (
  sessionId: string,
  schemeName: string,
  ggisReference: string,
  contactEmail?: string
) => {
  const newScheme = {
    name: schemeName,
    ggisReference: ggisReference,
    contactEmail: contactEmail,
  };

  await axios.post(
    `${BASE_SCHEME_URL}`,
    newScheme,
    axiosSessionConfig(sessionId)
  );
};

const getGrantScheme = async (schemeId: string, sessionId: string) => {
  const response = await axios.get(
    `${BASE_SCHEME_URL}/${schemeId}`,
    axiosSessionConfig(sessionId)
  );

  return response.data as Scheme;
};

const findApplicationFormFromScheme = (schemeId: string, sessionId: string) => {
  const applicationQueryObject: ApplicationQueryObject = {
    grantSchemeId: schemeId,
  };

  return findMatchingApplicationForms(applicationQueryObject, sessionId);
};

const patchScheme = async (
  schemeId: string,
  params: PatchSchemeParams,
  sessionId: string
) => {
  await axios.patch(
    `${BASE_SCHEME_URL}/${schemeId}`,
    {
      ...params,
    },
    axiosSessionConfig(sessionId)
  );
};

interface PatchSchemeParams {
  ggisReference?: string;
  contactEmail?: string;
}

export {
  getUserSchemes,
  createNewScheme,
  getGrantScheme,
  findApplicationFormFromScheme,
  patchScheme,
};
