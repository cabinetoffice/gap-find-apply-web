import { GrantApplicantOrganisationProfile } from './GrantApplicantOrganisationProfile';

export interface GrantApplicant {
  id: string;
  email: string;
  organisation: GrantApplicantOrganisationProfile;
}
