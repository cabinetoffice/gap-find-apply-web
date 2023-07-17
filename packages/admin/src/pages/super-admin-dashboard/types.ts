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
  gap_user_id: string;
  email: string;
  sub: string;
  roles: Role[];
  department?: Department;
};
