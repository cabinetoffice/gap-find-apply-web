import { FundingOrganisation } from '../types/models/FundingOrganisation';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';
import { axios } from '../utils/axios';

export class FundingOrganisationService {
  private static instance: FundingOrganisationService;

  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): FundingOrganisationService {
    if (!FundingOrganisationService.instance) {
      FundingOrganisationService.instance = new FundingOrganisationService();
    }
    return FundingOrganisationService.instance;
  }

  public async getFundingOrganisationById(
    founderId: string,
    jwt: string
  ): Promise<FundingOrganisation> {
    const { data } = await axios.get<FundingOrganisation>(
      `${this.BACKEND_HOST}/funding-organisations/${founderId}`,
      axiosConfig(jwt)
    );
    return data;
  }
}
