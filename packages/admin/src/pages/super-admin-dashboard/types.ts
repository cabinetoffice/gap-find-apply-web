export type Department = {
  id: string;
  ggisID?: string;
  name: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  label: string;
};

export type User = {
  gapUserId: string;
  emailAddress: string;
  sub: string;
  roles: Role[];
  role?: Role;
  department?: Department;
};

export type SuperAdminDashboardFilterData = {
  role: string | Array<string>;
  department: string | Array<string>;
  searchTerm: string;
  _csrf: string;
  'clear-all-filters'?: '';
  clearAllFilters?: boolean;
};
