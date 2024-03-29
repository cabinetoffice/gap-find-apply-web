export type Department = {
  id: string;
  ggisID?: string;
  name: string;
};

export type ChangeDepartmentDto = {
  departmentId: number;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  label: string;
};

export type User = {
  colaSub: string;
  gapUserId: string;
  emailAddress: string;
  sub: string;
  roles: Role[];
  role?: Role;
  department: Department | null;
  created: string;
};

export type SuperAdminDashboardFilterData = {
  roles?: string;
  departments?: string;
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
  queryParams: {
    roles: string[];
    departments: string[];
    searchTerm: string;
    clearAllFilters?: boolean;
  };
  userCount: number;
  previousFilterData: string[][];
  searchTerm: string;
  resetPagination?: boolean;
};
