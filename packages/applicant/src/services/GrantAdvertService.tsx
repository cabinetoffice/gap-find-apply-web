import axios from 'axios';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';
import { GrantAdvert } from '../types/models/GrantAdvert';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

export async function validateGrantWebpageUrl({
  jwt,
  contentfulSlug,
  grantWebpageUrl,
}: ValidateGrantWebpageUrlProps) {
  await axios.get<GrantAdvert>(
    `${BACKEND_HOST}/grant-adverts/validate-grant-webpage-url?contentfulSlug=${contentfulSlug}&grantWebpageUrl=${grantWebpageUrl}`,
    axiosConfig(jwt)
  );
}

export async function getAdvertBySlug(jwt: string, slug: string) {
  const { data } = await axios.get<GrantAdvert>(
    `${BACKEND_HOST}/grant-adverts?contentfulSlug=${slug}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function getAdvertBySchemeId(schemeId: string, jwt: string) {
  const { data } = await axios.get<GrantAdvert>(
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

export type ValidateGrantWebpageUrlProps = {
  jwt: string;
  contentfulSlug: string;
  grantWebpageUrl: string;
};
