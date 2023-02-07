import axios from 'axios';
import { GrantScheme } from '../models/GrantScheme';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config'

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
    grantSchemeId: String,
    jwt: string
  ): Promise<GrantScheme> {
    const { data } = await axios.get<GrantScheme>(
      `${this.BACKEND_HOST}/grant-schemes/${grantSchemeId}`,
      axiosConfig(jwt)
    );
    return data;
  }
}
