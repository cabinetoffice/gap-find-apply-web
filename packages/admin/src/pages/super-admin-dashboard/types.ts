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
  roles?: Array<string>;
  departments?: Array<string>;
  searchTerm?: string;
  _csrf?: string;
  'clear-all-filters'?: '';
  clearAllFilters?: boolean;
  resetPagination?: boolean;
};

export type SuperAdminDashboardResponse = {
  users: User[];
  departments: Department[];
  roles: Role[];
  userCount: number;
  previousFilterData: string[][];
  resetPagination?: boolean;
};
