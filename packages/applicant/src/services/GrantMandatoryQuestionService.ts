import axios from 'axios';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

export async function getMandatoryQuestionById(
  jwt: string,
  mandatoryQuestionId: string
): Promise<GrantMandatoryQuestionDto> {
  const { data } = await axios.get<GrantMandatoryQuestionDto>(
    `${BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}}`,
    axiosConfig(jwt)
  );
  return data;
}

export async function updateMandatoryQuestion(
  jwt: string,
  mandatoryQuestionId: string,
  body: GrantMandatoryQuestionDto
): Promise<string> {
  const { data } = await axios.patch<string>(
    `${BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}}`,
    body,
    axiosConfig(jwt)
  );

  return data;
}

export interface GrantMandatoryQuestionDto {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  charityCommissionNumber?: string;
  companiesHouseNumber?: string;
  orgType?: string;
  fundingAmount?: string;
  fundingLocation?: string;
  schemeId?: number;
  submissionId?: string;
}
