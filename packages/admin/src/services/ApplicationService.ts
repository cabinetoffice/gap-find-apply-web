import axios from 'axios';
import ApplicationQueryObject from '../types/ApplicationQueryObject';
import {
  ApplicationFormSummary,
  ApplicationFormSection,
} from '../types/ApplicationForm';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';
import FindApplicationFormStatsResponse from '../types/FindApplicationFormStatsResponse';

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
  applicationId: string
) => {
  await axios.patch(`${BASE_APPLICATION_URL}/${applicationId}/sections/order`, {
    sectionId,
    increment,
  });
};

export {
  createNewApplicationForm,
  findMatchingApplicationForms,
  getApplicationFormSummary,
  getApplicationFormSection,
  updateApplicationFormStatus,
  handleSectionOrdering,
};
