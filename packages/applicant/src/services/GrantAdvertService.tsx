import axios from 'axios';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';
import { GrantMandatoryQuestionDto } from './GrantMandatoryQuestionService';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

export async function getAdvertBySlug(jwt: string, slug: string) {
  const { data } = await axios.get<AdvertDto>(
    `${BACKEND_HOST}/grant-adverts?contentfulSlug=${slug}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function getAdvertBySchemeId(schemeId: string, jwt: string) {
  const { data } = await axios.get<AdvertDto>(
    `${BACKEND_HOST}/grant-adverts/scheme/${schemeId}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function checkIfGrantExistsInContentful(
  slug: string,
  jwt: string
) {
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
  mandatoryQuestionDto?: GrantMandatoryQuestionDto;
}
