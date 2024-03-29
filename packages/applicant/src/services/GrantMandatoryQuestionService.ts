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
    mandatoryQuestionId: string,
    jwt: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async getMandatoryQuestionBySubmissionId(
    submissionId: string,
    jwt: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/get-by-submission/${submissionId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async getMandatoryQuestionBySchemeId(
    jwt: string,
    schemeId: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.get<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/scheme/${schemeId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async updateMandatoryQuestion(
    jwt: string,
    mandatoryQuestionId: string,
    url: string,
    body: GrantMandatoryQuestionDto
  ): Promise<string> {
    const { data } = await axios.patch<string>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}?url=${url}`,
      body,
      axiosConfig(jwt)
    );

    return data;
  }

  public async createMandatoryQuestion(
    schemeId: string,
    jwt: string
  ): Promise<GrantMandatoryQuestionDto> {
    const { data } = await axios.post<GrantMandatoryQuestionDto>(
      `${this.BACKEND_HOST}/grant-mandatory-questions?schemeId=${parseInt(
        schemeId
      )}`,
      {},
      axiosConfig(jwt)
    );

    return data;
  }

  public async existBySchemeIdAndApplicantId(schemeId: string, jwt: string) {
    const { data } = await axios.get<boolean>(
      `${this.BACKEND_HOST}/grant-mandatory-questions/scheme/${schemeId}/exists`,
      axiosConfig(jwt)
    );
    return data;
  }
}
export interface GrantMandatoryQuestionDto {
  id?: string;
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
  fundingLocation?: string[];
  schemeId?: number;
  submissionId?: string;
  mandatoryQuestionsComplete?: boolean;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}
