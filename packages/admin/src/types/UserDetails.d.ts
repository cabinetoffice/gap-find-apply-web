type UserDetails = {
  firstName: string;
  lastName: string;
  organisationName: string;
  emailAddress: string;
  roles: Role[];
};

export type Role = {
  name: string;
  id: string;
  description: string;
};

export default UserDetails;
