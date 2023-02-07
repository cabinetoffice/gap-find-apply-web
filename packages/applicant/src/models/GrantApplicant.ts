import { GrantApplicantOrganisationProfile } from './GrantApplicantOrganisationProfile';

export interface GrantApplicant {
  id: string;
  fullName: string;
  organisation: GrantApplicantOrganisationProfile;
}
