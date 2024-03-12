import axios from 'axios';
import getConfig from 'next/config';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../types/ApplicationForm';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import FindApplicationFormStatsResponse from '../types/FindApplicationFormStatsResponse';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';

const createNewApplicationForm = async (
  grantSchemeId: string,
  applicationName: string,
  sessionId: string
) => {
  const newApplicationForm = {
    grantSchemeId: grantSchemeId,
    applicationName: applicationName,
  };

  const response = await axios.post(
    `${BASE_APPLICATION_URL}`,
    newApplicationForm,
    axiosSessionConfig(sessionId)
  );
  return response.data.id as string;
};

const findMatchingApplicationForms = async (
  queryObject: ApplicationQueryObject,
  sessionId: string
): Promise<FindApplicationFormStatsResponse[]> => {
  try {
    const res = await axios.get(`${BASE_APPLICATION_URL}/find`, {
      params: queryObject,
      ...axiosSessionConfig(sessionId),
    });
    return res.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return [];
    }
    throw err;
  }
};

const getApplicationFormSummary = async (
  applicationId: string,
  sessionId: string,
  withSections = true as boolean,
  withQuestions = true as boolean
) => {
  const response = await axios.get(`${BASE_APPLICATION_URL}/${applicationId}`, {
    params: {
      withSections: withSections,
      withQuestions: withQuestions,
    },
    ...axiosSessionConfig(sessionId),
  });
  return response.data as ApplicationFormSummary;
};

const getApplicationFormSection = async (
  applicationId: string,
  sectionId: string,
  sessionId: string
) => {
  const response = await axios.get(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}`,
    axiosSessionConfig(sessionId)
  );
  return response.data as ApplicationFormSection;
};

const updateApplicationFormStatus = async (
  applicationId: string,
  newApplicationStatus: ApplicationFormSummary['applicationStatus'],
  sessionId: string
) => {
  await axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}`,
    {
      applicationStatus: newApplicationStatus,
    },
    axiosSessionConfig(sessionId)
  );
};

const handleSectionOrdering = async (
  increment: number,
  sectionId: string,
  applicationId: string,
  sessionId: string
) => {
  await axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/order`,
    {
      sectionId,
      increment,
    },
    axiosSessionConfig(sessionId)
  );
};

type HandleQuestionOrderingProps = {
  sessionId: string;
  applicationId: string;
  sectionId: string;
  questionId: string;
  increment: number;
  version: number;
};

const handleQuestionOrdering = async ({
  sessionId,
  applicationId,
  sectionId,
  questionId,
  increment,
  version,
}: HandleQuestionOrderingProps) => {
  await axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}/questions/${questionId}/order/${increment}?version=${version}`,
    {},
    axiosSessionConfig(sessionId)
  );
};

const getLastEditedEmail = async (applicationId: string, sessionId: string) => {
  const response = await axios.get(
    `${BASE_APPLICATION_URL}/${applicationId}/lastUpdated/email`,
    axiosSessionConfig(sessionId)
  );
  return response.data;
};

const getApplicationStatus = async (
  applicationId: string,
  sessionId: string
) => {
  const response = await axios.get(
    `${BASE_APPLICATION_URL}/${applicationId}/status`,
    axiosSessionConfig(sessionId)
  );
  return response.data;
};

export {
  createNewApplicationForm,
  findMatchingApplicationForms,
  getApplicationFormSection,
  getApplicationFormSummary,
  getApplicationStatus,
  getLastEditedEmail,
  handleQuestionOrdering,
  handleSectionOrdering,
  updateApplicationFormStatus,
};
