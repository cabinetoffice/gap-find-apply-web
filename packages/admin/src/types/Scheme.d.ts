interface Scheme {
  name: string;
  schemeId: string;
  ggisReference: string;
  funderId: string;
  createdDate: string;
  description?: string;
  contactEmail?: string;
  applicationFormId?: string;
  version?: string;
  lastUpdatedDate: string;
  lastUpdatedByADeletedUser: boolean;
  lastUpdatedBy: string;
  encryptedLastUpdatedBy: string;
}

export default Scheme;
