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

export class ApplicationService {
  private static instance: ApplicationService;
  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  public async doesSchemeHaveApplication(
    grantScheme: GrantScheme,
    jwt: string
  ): Promise<boolean> {
    const serializedScheme = JSON.stringify(grantScheme);
    const { data } = await axios.get<boolean>(
      `${
        this.BACKEND_HOST
      }/grant-application/does-scheme-have-application?grantScheme=${encodeURIComponent(
        serializedScheme
      )}}`,
      axiosConfig(jwt)
    );
    return data;
  }
}
