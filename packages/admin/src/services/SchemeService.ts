import axios from 'axios';
import getConfig from 'next/config';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import Pagination from '../types/Pagination';
import Scheme from '../types/Scheme';
import { axiosSessionConfig, getFullConfig } from '../utils/session';
import { findMatchingApplicationForms } from './ApplicationService';
import { EditorList } from '../pages/scheme/[schemeId]/editors.getServerSideProps';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_SCHEME_URL = BACKEND_HOST + '/schemes';
const SCHEME_EDITORS_HOST = BACKEND_HOST + '/schemeEditors';

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

export const getGrantScheme = async (schemeId: string, sessionId: string) => {
  const response = await axios.get(
    `${BASE_SCHEME_URL}/${schemeId}`,
    axiosSessionConfig(sessionId)
  );

  return response.data as Scheme;
};

export const isSchemeOwner = async (schemeId: string, sessionId: string) => {
  const { data } = await axios.get<boolean>(
    `${SCHEME_EDITORS_HOST}/${schemeId}/isSchemeOwner`,
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
    `${SCHEME_EDITORS_HOST}/${schemeId}/editors`,
    getFullConfig(sessionId, userServiceJwt)
  );
  return data;
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
