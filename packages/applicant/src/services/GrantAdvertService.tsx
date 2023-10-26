import axios from 'axios';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

export async function getAdvertBySlug(
  jwt: string,
  slug: string
): Promise<AdvertDto> {
  const { data } = await axios.get<AdvertDto>(
    `${BACKEND_HOST}/grant-adverts?contentfulSlug=${slug}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function checkIfGrantExistsInContentful(
  slug: string,
  jwt: string
): Promise<GrantExistsInContentfulDto> {
  const { data } = await axios.get<GrantExistsInContentfulDto>(
    `${BACKEND_HOST}/grant-adverts/${slug}/exists-in-contentful`,
    axiosConfig(jwt)
  );
  return data;
}

export interface GrantExistsInContentfulDto {
  isAdvertInContentful: boolean;
}
export interface AdvertDto {
  id?: string;
  externalSubmissionUrl?: string;
  version?: number;
  grantApplicationId?: number;
  isInternal?: boolean;
  grantSchemeId?: number;
  isAdvertInDatabase: boolean;
}

export class GrantAdvertService {
  private static instance: GrantAdvertService;
  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): GrantAdvertService {
    if (!GrantAdvertService.instance) {
      GrantAdvertService.instance = new GrantAdvertService();
    }
    return GrantAdvertService.instance;
  }

  public async getExternalLink(schemeId: string, jwt: string): Promise<string> {
    const { data } = await axios.get<string>(
      `${this.BACKEND_HOST}/grant-adverts/get-external-link?schemeId=${parseInt(
        schemeId
      )}`,
      axiosConfig(jwt)
    );
    return data;
  }
}
