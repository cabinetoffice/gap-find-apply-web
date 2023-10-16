import axios from 'axios';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';

export class GrantMandatoryQuestionService {
  private static instance: GrantMandatoryQuestionService;

  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): GrantMandatoryQuestionService {
    if (!GrantMandatoryQuestionService.instance) {
      GrantMandatoryQuestionService.instance =
        new GrantMandatoryQuestionService();
    }
    return GrantMandatoryQuestionService.instance;
  }

  public async getMandatoryQuestionById(
    jwt: string,
    mandatoryQuestionId: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async updateMandatoryQuestion(
    jwt: string,
    mandatoryQuestionId: string,
    body: GrantMandatoryQuestionDto
  ): Promise<string> {
    const { data } = await axios.patch<string>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}`,
      body,
      axiosConfig(jwt)
    );

    return data;
  }
}
export interface GrantMandatoryQuestionDto {
  id: string;
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
