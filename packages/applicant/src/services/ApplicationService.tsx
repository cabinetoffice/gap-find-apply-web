import axios from 'axios';
import getConfig from 'next/config';
import { GrantScheme } from '../models/GrantScheme';
import { axiosConfig } from '../utils/jwt';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

export async function getApplicationsListById(
  jwt: string
): Promise<ApplicationsList[]> {
  const { data } = await axios.get<ApplicationsList[]>(
    `${BACKEND_HOST}/submissions`,
    axiosConfig(jwt)
  );
  return data;
}

export const getApplicationStatusBySchemeId = async (
  schemeId: string,
  jwt: string
) => {
  const { data } = await axios.get<string>(
    `${BACKEND_HOST}/grant-application/${schemeId}/status`,
    axiosConfig(jwt)
  );
  return data;
};

export async function getApplicationById(applicationId: string, jwt: string) {
  const { data } = await axios.get<Application>(
    `${BACKEND_HOST}/grant-application/${applicationId}`,
    axiosConfig(jwt)
  );
  return data;
}

export interface Application {
  id: number;
  grantScheme: GrantScheme;
  version: number;
  created: string;
  lastUpdated: string;
  lastUpdatedBy: number;
  applicationName: string;
  applicationStatus: string;
  definition: string;
}

export interface ApplicationsList {
  grantSchemeId: string;
  grantApplicationId: string;
  grantSubmissionId: string;
  applicationName: string;
  submissionStatus: string;
  sections: ApplicationSections[];
}

export interface ApplicationSections {
  sectionId: string;
  sectionTitle: string;
  sectionStatus: string;
}
