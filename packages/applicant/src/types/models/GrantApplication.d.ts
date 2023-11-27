import { GrantScheme } from './GrantScheme';

export type GrantApplication = {
  id: string;
  grantScheme?: GrantScheme;
  version: number;
  created: string;
  lastUpdated: string;
  lastUpdatedBy: number;
  applicationName: string;
  applicationStatus: string;
  definition: string;
};
