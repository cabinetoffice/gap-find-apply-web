import axios from 'axios';
import { GrantApplicantOrganisationProfile } from '../types/models/GrantApplicantOrganisationProfile';
import { axiosConfig } from '../utils/jwt';
import getConfig from 'next/config';

export interface UpdateOrganisationDetailsDto {
  id?: string;
  legalName?: string;
  type?: string;
  addressLine1?: string;
  addressLine2?: string;
  town?: string;
  county?: string;
  postcode?: string;
  charityCommissionNumber?: string;
  companiesHouseNumber?: string;
}

export class GrantApplicantOrganisationProfileService {
  private static instance: GrantApplicantOrganisationProfileService;

  private BACKEND_HOST: string;

  private constructor() {
    const { serverRuntimeConfig } = getConfig();
    this.BACKEND_HOST = serverRuntimeConfig.backendHost;
  }

  public static getInstance(): GrantApplicantOrganisationProfileService {
    if (!GrantApplicantOrganisationProfileService.instance) {
      GrantApplicantOrganisationProfileService.instance =
        new GrantApplicantOrganisationProfileService();
    }
    return GrantApplicantOrganisationProfileService.instance;
  }

  public async getOrganisationById(
    organisationId: string,
    jwt: string
  ): Promise<GrantApplicantOrganisationProfile> {
    const url = `${this.BACKEND_HOST}/grant-applicant-organisation-profile/${organisationId}`;
    const { data } = await axios.get<GrantApplicantOrganisationProfile>(
      url,
      axiosConfig(jwt)
    );

    return data;
  }

  public async isOrgProfileComplete(jwt: string) {
    const url = `${this.BACKEND_HOST}/grant-applicant-organisation-profile/isComplete`;
    const { data } = await axios.get<boolean>(url, axiosConfig(jwt));
    return data;
  }

  public async updateOrganisation(
    organisation: UpdateOrganisationDetailsDto,
    jwt: string
  ) {
    await axios.patch(
      `${this.BACKEND_HOST}/grant-applicant-organisation-profile/${organisation.id}`,
      organisation,
      axiosConfig(jwt)
    );
  }
}
