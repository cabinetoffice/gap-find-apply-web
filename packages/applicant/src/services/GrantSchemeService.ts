import { GrantScheme } from '../types/models/GrantScheme';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';
import { GrantApplication } from '../types/models/GrantApplication';
import { GrantAdvert } from '../types/models/GrantAdvert';
import { axios } from '../utils/axios';

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
}
