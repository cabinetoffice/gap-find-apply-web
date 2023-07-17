export type Department = {
  id: string;
  ggisID?: string;
  name: string;
};

export type Role = {
  id: string;
  name: string;
};

export type User = {
  gapUserId: string;
  emailAddress: string;
  sub: string;
  roles: Role[];
  department?: Department;
};
