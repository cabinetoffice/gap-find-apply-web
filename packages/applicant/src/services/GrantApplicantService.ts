import axios from 'axios';
import { GrantApplicant } from '../models/GrantApplicant';
import { RegisterAnApplicant } from '../pages/register/index.page';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';

export class GrantApplicantService {
  private static instance: GrantApplicantService;
  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): GrantApplicantService {
    if (!GrantApplicantService.instance) {
      GrantApplicantService.instance = new GrantApplicantService();
    }
    return GrantApplicantService.instance;
  }

  public async getGrantApplicant(jwt: string) {
    const { data } = await axios.get<GrantApplicant>(
      `${this.BACKEND_HOST}/grant-applicant`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async doesApplicantExist(jwt: string): Promise<Boolean> {
    const { data } = await axios.get<Boolean>(
      `${this.BACKEND_HOST}/grant-applicant/does-exist`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async createAnApplicant(jwt: string): Promise<String> {
    const { data } = await axios.post<String>(
      `${this.BACKEND_HOST}/grant-applicant/create`,
      null,
      axiosConfig(jwt)
    );
    return data;
  }

  public async registerAnApplicant(applicantInformation: RegisterAnApplicant) {
    const response = await axios.post(
      `${this.BACKEND_HOST}/grant-applicant/register`,
      applicantInformation
    );
    return response.data;
  }
}
