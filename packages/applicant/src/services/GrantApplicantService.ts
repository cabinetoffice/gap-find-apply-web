import axios from 'axios';
import { GrantApplicant } from '../types/models/GrantApplicant';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';

export interface RegisterAnApplicant {
  email: string;
  emailConfirmed: string;
  telephone: string;
  privacyPolicy?: string;
}

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

  public async doesApplicantExist(jwt: string): Promise<boolean> {
    const { data } = await axios.get<boolean>(
      `${this.BACKEND_HOST}/grant-applicant/does-exist`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async createAnApplicant(jwt: string): Promise<string> {
    const { data } = await axios.post<string>(
      `${this.BACKEND_HOST}/grant-applicant/create`,
      null,
      axiosConfig(jwt)
    );
    return data;
  }
}
