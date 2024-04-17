import getConfig from 'next/config';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../types/ApplicationForm';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import FindApplicationFormStatsResponse from '../types/FindApplicationFormStatsResponse';
import { decrypt } from '../utils/encryption';
import { axiosSessionConfig } from '../utils/session';
import { mapSingleSection } from '../utils/applicationSummaryHelper';
import { axios } from '../utils/axios';

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
  const response = await axios.get<ApplicationFormSummary>(
    `${BASE_APPLICATION_URL}/${applicationId}`,
    {
      params: {
        withSections: withSections,
        withQuestions: withQuestions,
      },
      ...axiosSessionConfig(sessionId),
    }
  );
  return response.data;
};

const getApplicationFormSection = async (
  applicationId: string,
  sectionId: string,
  sessionId: string,
  isV2Scheme?: boolean
) => {
  const sectionNeedsMapped =
    isV2Scheme &&
    ['ORGANISATION_DETAILS', 'FUNDING_DETAILS'].includes(sectionId);

  const { data } = await axios.get<ApplicationFormSection>(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${
      sectionNeedsMapped ? 'ESSENTIAL' : sectionId
    }`,
    axiosSessionConfig(sessionId)
  );

  if (!sectionNeedsMapped) return data;

  return mapSingleSection(
    data,
    sectionId as 'ORGANISATION_DETAILS' | 'FUNDING_DETAILS'
  );
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
  sessionId: string,
  version: string
) => {
  await axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/order`,
    {
      sectionId,
      increment,
      version,
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
  const {
    data: { encryptedEmail, deletedUser },
  } = await axios.get<{
    encryptedEmail: string;
    deletedUser: boolean;
  }>(
    `${BASE_APPLICATION_URL}/${applicationId}/lastUpdated/email`,
    axiosSessionConfig(sessionId)
  );

  if (deletedUser) return 'Deleted user';

  return decrypt(encryptedEmail);
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

export async function downloadSummary(
  applicationId: string,
  sessionId: string
) {
  return await axios.get(
    `${BASE_APPLICATION_URL}/${applicationId}/download-summary`,
    {
      ...axiosSessionConfig(sessionId),
      responseType: 'arraybuffer',
    }
  );
}

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
