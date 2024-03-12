import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig, getFullConfig } from '../utils/session';

import { decrypt } from '../utils/encryption';
import EditableSchemes from '../types/EditableSchemes';
import Scheme from '../types/Scheme';
import Pagination from '../types/Pagination';

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

const decryptSchemeEditors = async (editor: EditorList) => ({
  ...editor,
  email: await decrypt(editor.email),
});

export const getSchemeEditors = async (
  schemeId: string,
  sessionId: string,
  userServiceJwt: string
) => {
  const { data } = await axios.get<EditorList[]>(
    `${SCHEME_HOST}/${schemeId}/editors`,
    getFullConfig(sessionId, userServiceJwt)
  );

  return Promise.all(data.map(decryptSchemeEditors));
};

export const addSchemeEditor = async (
  schemeId: string,
  sessionId: string,
  userToken: string,
  editorEmailAddress: string
) => {
  const response = await axios.post(
    `${SCHEME_HOST}/${schemeId}/editors`,
    { editorEmailAddress },
    getFullConfig(sessionId, userToken)
  );
  return response.data;
};

export async function removeEditor(
  sessionCookie: string,
  schemeId: string,
  editorId: string
) {
  await axios.delete(
    `${SCHEME_HOST}/${schemeId}/editors/${editorId}`,
    axiosSessionConfig(sessionCookie)
  );
}

export const getOwnedAndEditableSchemes = async (
  pagination: Pagination,
  sessionId: string
) => {
  const response = await axios.get<EditableSchemes>(`${SCHEME_HOST}/editable`, {
    params: pagination,
    ...axiosSessionConfig(sessionId),
  });

  return decryptOwnedAndEditableSchemes(response.data);
};

const decryptOwnedAndEditableSchemes = async (
  editableSchemes: EditableSchemes
) => {
  const decryptedEditableSchemes = await Promise.all(
    Object.entries(editableSchemes).map(formatEditableSchemeObject)
  );

  return Object.fromEntries(decryptedEditableSchemes);
};

const formatEditableSchemeObject = async ([key, schemes]: [
  string,
  Scheme[]
]) => [key, await Promise.all(schemes.map(decryptLastUpdatedBy))];

export const decryptLastUpdatedBy = async (scheme: Scheme) => {
  if (scheme.lastUpdatedBy === 'Deleted User') return scheme;

  if (scheme.encryptedLastUpdatedBy)
    scheme.lastUpdatedBy = await decrypt(scheme.encryptedLastUpdatedBy);

  return scheme;
};
