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
    `${BACKEND_HOST}/grant-adverts/exists-in-contentful?advertSlug=${slug}`,
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
  isAdvertOnlyInContentful: boolean;
}
