import getConfig from 'next/config';
import { ApplicationFormStatus } from '../types/ApplicationForm';
import { axios } from '../utils/axios';
import { AxiosConfig, axiosSessionConfig } from '../utils/session';
import { UpdateSectionTitleProps } from '../types/Section';

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
  sectionId: string,
  version: string
): Promise<void> => {
  return axios.delete(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}?version=${version}`,
    axiosSessionConfig(sessionId)
  );
};

const updateSectionStatus = (
  sessionId: string,
  applicationId: string,
  sectionId: string,
  newSectionStatus: ApplicationFormStatus
) => {
  const config: AxiosConfig = {
    ...axiosSessionConfig(sessionId),
  };
  config.headers['Content-Type'] = 'application/json';

  return axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}`,
    newSectionStatus,
    config
  );
};

const updateSectionTitle = async ({
  sessionId,
  applicationId,
  sectionId,
  body: { sectionTitle, version },
}: UpdateSectionTitleProps) => {
  await axios.patch(
    `${BASE_APPLICATION_URL}/${applicationId}/sections/${sectionId}/title`,
    { sectionTitle, version },
    axiosSessionConfig(sessionId)
  );
};

export { postSection, deleteSection, updateSectionStatus, updateSectionTitle };
