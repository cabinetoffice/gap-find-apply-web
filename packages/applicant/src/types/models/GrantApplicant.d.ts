import { GrantApplicantOrganisationProfile } from './GrantApplicantOrganisationProfile';

export type GrantApplicant = {
  id: string;
  email: string;
  organisation: GrantApplicantOrganisationProfile;
};
