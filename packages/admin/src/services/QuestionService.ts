import getConfig from 'next/config';
import ResponseType from '../enums/ResponseType';
import { ApplicationFormQuestion } from '../types/ApplicationForm';
import { axios } from '../utils/axios';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';

const patchQuestion = (
  sessionId: string,
  applicationId: string,
  sectionId: string,
  questionId: string,
  values: Partial<{
    fieldTitle: string;
    displayText: string;
    hintText: string;
    validation: { mandatory: boolean; maxWords?: string | number };
    options: string[];
    responseType: ResponseType;
    version: number;
  }>
): Promise<void> => {
  return axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}/questions/${questionId}`,
    values,
    axiosSessionConfig(sessionId)
  );
};

const postQuestion = (
  sessionId: string,
  applicationId: string,
  sectionId: string,
  body: {
    fieldTitle: string;
    responseType: ResponseType;
    profileField?: string;
    hintText?: string;
    displayText?: string;
    questionSuffix?: string;
    validation: { maxWords?: string | number; mandatory: boolean };
    options?: string[];
  }
): Promise<void> => {
  return axios.post(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}/questions`,
    body,
    axiosSessionConfig(sessionId)
  );
};

const getQuestion = async (
  sessionId: string,
  applicationId: string,
  sectionId: string,
  questionId: string,
  isV2Scheme?: boolean
): Promise<ApplicationFormQuestion> => {
  const isEssentialQuestion =
    isV2Scheme &&
    ['ORGANISATION_DETAILS', 'FUNDING_DETAILS'].includes(sectionId);

  const section = isEssentialQuestion ? 'ESSENTIAL' : sectionId;

  return (
    await axios.get(
      `${BASE_APPLICATION_URL}/${applicationId}/sections/${section}/questions/${questionId}`,
      axiosSessionConfig(sessionId)
    )
  ).data;
};

const deleteQuestion = (
  sessionId: string,
  applicationId: string,
  sectionId: string,
  questionId: string,
  version: string
): Promise<void> => {
  return axios.delete(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}/questions/${questionId}?version=${version}`,
    axiosSessionConfig(sessionId)
  );
};

export { patchQuestion, postQuestion, getQuestion, deleteQuestion };
