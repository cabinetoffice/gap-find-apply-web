import axios from 'axios';
import { GrantScheme } from '../types/models/GrantScheme';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';
import { GrantApplication } from '../types/models/GrantApplication';
import { GrantAdvert } from '../types/models/GrantAdvert';

export class GrantSchemeService {
  private static instance: GrantSchemeService;
  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): GrantSchemeService {
    if (!GrantSchemeService.instance) {
      GrantSchemeService.instance = new GrantSchemeService();
    }
    return GrantSchemeService.instance;
  }

  public async getGrantSchemeById(
    grantSchemeId: string,
    jwt: string
  ): Promise<{
    grantScheme: GrantScheme;
    grantApplication?: GrantApplication;
    grantAdverts?: GrantAdvert[];
  }> {
    const { data } = await axios.get(
      `${this.BACKEND_HOST}/grant-schemes/${grantSchemeId}`,
      axiosConfig(jwt)
    );
    return data;
  }

  public async hasSchemeInternalApplication(
    grantSchemeId: string,
    jwt: string
  ): Promise<MandatoryQuestionApplicationsInfosDto> {
    const { data } = await axios.get(
      `${this.BACKEND_HOST}/grant-schemes/${grantSchemeId}/hasInternalApplication`,
      axiosConfig(jwt)
    );
    return data;
  }
}

export interface MandatoryQuestionApplicationsInfosDto {
  hasInternalApplication: boolean;
  hasPublishedInternalApplication: boolean;
  hasAdvertPublished: boolean;
}
