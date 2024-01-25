import axios from 'axios';
import { ApplicationFormStatus } from '../types/ApplicationForm';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';

const postSection = async (
  sessionId: string,
  applicationId: string,
  body: {
    sectionTitle: string;
  }
): Promise<string> => {
  const response = await axios.post(
    `${BASE_APPLICATION_URL}/${applicationId}/sections`,
    body,
    axiosSessionConfig(sessionId)
  );
  return response.data.id;
};

const deleteSection = (
  sessionId: string,
  applicationId: string,
  sectionId: string
): Promise<void> => {
  return axios.delete(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}`,
    axiosSessionConfig(sessionId)
  );
};

const updateSectionStatus = (
  sessionId: string,
  applicationId: string,
  sectionId: string,
  newSectionStatus: ApplicationFormStatus
) => {
  const config: any = {
    ...axiosSessionConfig(sessionId),
  };
  config.headers['Content-Type'] = 'application/json';

  return axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}`,
    newSectionStatus,
    config
  );
};

export { postSection, deleteSection, updateSectionStatus };
