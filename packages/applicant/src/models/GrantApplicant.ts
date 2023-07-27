import { GrantApplicantOrganisationProfile } from './GrantApplicantOrganisationProfile';

export interface GrantApplicant {
  id: string;
  fullName: string;
  email: string;
  organisation: GrantApplicantOrganisationProfile;
}
