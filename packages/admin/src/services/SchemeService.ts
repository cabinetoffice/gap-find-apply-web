import getConfig from 'next/config';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import Pagination from '../types/Pagination';
import Scheme from '../types/Scheme';
import { axios } from '../utils/axios';
import { axiosSessionConfig } from '../utils/session';
import { findMatchingApplicationForms } from './ApplicationService';
import { decryptLastUpdatedBy } from './SchemeEditorService';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SCHEME_URL = BACKEND_HOST + '/schemes';

export const getUserSchemes = async (
  pagination: Pagination,
  sessionId: string
) => {
  const response = await axios.get<Scheme[]>(`${BASE_SCHEME_URL}`, {
    params: pagination,
    ...axiosSessionConfig(sessionId),
  });

  return response.data;
};

export const getAdminsSchemes = async (
  grantAdminId: string,
  sessionId: string
) => {
  const response = await axios.get<Scheme[]>(
    `${BASE_SCHEME_URL}/admin/${grantAdminId}`,
    axiosSessionConfig(sessionId)
  );

  return response.data;
};

export const createNewScheme = async (
  sessionId: string,
  grantName: string,
  ggisReference: string,
  contactEmail?: string
) => {
  const newScheme = {
    grantName: grantName,
    ggisReference: ggisReference,
    contactEmail: contactEmail,
  };

  return await axios.post(
    `${BASE_SCHEME_URL}`,
    newScheme,
    axiosSessionConfig(sessionId)
  );
};

export const getGrantScheme = async (schemeId: string, sessionId: string) => {
  const { data } = await axios.get<Scheme>(
    `${BASE_SCHEME_URL}/${schemeId}`,
    axiosSessionConfig(sessionId)
  );

  return decryptLastUpdatedBy(data);
};

export const findApplicationFormFromScheme = (
  schemeId: string,
  sessionId: string
) => {
  const applicationQueryObject: ApplicationQueryObject = {
    grantSchemeId: schemeId,
  };

  return findMatchingApplicationForms(applicationQueryObject, sessionId);
};

export const patchScheme = async (
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

export const changeSchemeOwnership = async (
  schemeId: string,
  sessionId: string,
  userToken: string,
  emailAddress: string
) => {
  await axios.patch(
    `${BASE_SCHEME_URL}/${schemeId}/scheme-ownership`,
    { emailAddress },
    {
      withCredentials: true,
      headers: {
        Cookie: `SESSION=${sessionId};${process.env.JWT_COOKIE_NAME}=${userToken}`,
      },
    }
  );
};

export const schemeApplicationIsInternal = async (
  schemeId: string,
  sessionId: string
): Promise<boolean> => {
  const response = await axios.get(
    `${BASE_SCHEME_URL}/${schemeId}/hasInternalApplicationForm`,
    axiosSessionConfig(sessionId)
  );
  return response.data;
};
