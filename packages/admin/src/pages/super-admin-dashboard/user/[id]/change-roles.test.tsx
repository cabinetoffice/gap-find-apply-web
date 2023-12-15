import '@testing-library/jest-dom';
import { parseBody } from 'next/dist/server/api-utils/node';
import { render, screen } from '@testing-library/react';
import EditRoleWithId, { getServerSideProps } from './change-roles.page';
import UserDetails from '../../../../types/UserDetails';
import { getContext } from 'gap-web-ui';
import { getUserById } from '../../../../services/SuperAdminService';

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(),
  getAllRoles: async () => getMockRoles(),
  updateUserRoles: jest.fn(),
}));

jest.mock('next/dist/server/api-utils/node', () => {
  return { parseBody: jest.fn() };
});

const getMockRoles = () => [
  {
    id: '1',
    name: 'FIND',
    description: 'this is a description',
    label: 'Find',
  },
  {
    id: '2',
    name: 'APPLICANT',
    description: 'this is another description',
    label: 'Applicant',
  },
  {
    id: '3',
    name: 'ADMIN',
    description: 'this is another description',
    label: 'Administrator',
  },
  {
    id: '4',
    name: 'SUPER_ADMIN',
    description: 'this is a super admin description',
    label: 'Super administrator',
  },
];

const getMockUser = (): User => ({
  gapUserId: 'john',
  sub: 'sub',
  emailAddress: 'superAdmin@and.digital',
  roles: [getMockRoles()[0], getMockRoles()[3]],
  created: 'NULL',

});

const component = (
  <EditRoleWithId
    formAction="."
    pageData={{
      roles: getMockRoles(),
      user: getMockUser(),
      userId: '1',
    }}
    csrfToken="csrf"
    fieldErrors={[]}
    previousValues={{ newUserRoles: ['FIND', 'SUPER_ADMIN'] }}
  />
);

describe('Edit role page', () => {
  beforeEach(jest.clearAllMocks);

  test('Should only check input roles which the queried user has', () => {
    render(component);
    expect(
      screen.getByText('Find').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Super administrator').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Administrator').parentElement?.previousSibling
    ).not.toBeChecked();
    expect(
      screen.getByText('Applicant').parentElement?.previousSibling
    ).not.toBeChecked();
  });

  test('Should redirect to change department page if new Admin user', async () => {
    (parseBody as jest.Mock).mockReturnValue({ newUserRoles: ['3', '4'] });
    (getUserById as jest.Mock).mockReturnValue({
      firstName: 'john',
      lastName: 'm',
      organisationName: 'tco',
      emailAddress: 'superAdmin@and.digital',
      roles: [getMockRoles()[0], getMockRoles()[1]],
      created: 'NULL',
    });

    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(result).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1/change-department',
        statusCode: 302,
      },
    });
  });

  test('Should redirect to account page as User who is an Applicant', async () => {
    (parseBody as jest.Mock).mockReturnValue({ newUserRoles: ['1', '2'] });
    (getUserById as jest.Mock).mockReturnValue({
      firstName: 'john',
      lastName: 'm',
      organisationName: 'tco',
      emailAddress: 'superAdmin@and.digital',
      roles: [getMockRoles()[0], getMockRoles()[1]],
      created: 'NULL',
    });
    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(result).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1',
        statusCode: 302,
      },
    });
  });

  test('Should redirect to account page as User who is already Admin', async () => {
    (parseBody as jest.Mock).mockReturnValue({ newUserRoles: ['1', '2', '3'] });
    (getUserById as jest.Mock).mockReturnValue({
      firstName: 'john',
      lastName: 'm',
      organisationName: 'tco',
      emailAddress: 'superAdmin@and.digital',
      roles: [getMockRoles()[2], getMockRoles()[3]],
      created: 'NULL',
    });
    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(result).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1',
        statusCode: 302,
      },
    });
  });
});
