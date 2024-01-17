import '@testing-library/jest-dom';
import { parseBody } from 'next/dist/server/api-utils/node';
import { render, screen } from '@testing-library/react';
import EditRoleWithId, { getServerSideProps } from './change-roles.page';
import UserDetails from '../../../../types/UserDetails';
import { getContext } from 'gap-web-ui';
import { getUserById } from '../../../../services/SuperAdminService';
import { Department, User, Role } from '../../types';

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(),
  getAllRoles: async () => getMockRoles(),
  updateUserRoles: jest.fn(),
}));

jest.mock('next/dist/server/api-utils/node', () => ({
  parseBody: jest.fn(),
}));

const mockGetUserById = jest.mocked(getUserById);
const mockParseBody = jest.mocked(parseBody);

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

const getMockUser = (
  roles: Role[] = getMockRoles(),
  department: Department | null = null
): User => ({
  colaSub: '',
  gapUserId: '1',
  emailAddress: 'test@gmail.com',
  sub: 'testSub',
  roles: roles,
  department: department,
  created: 'now',
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
    //user has all roles (see component)
    render(component);
    expect(
      screen.getByText('Find').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Super administrator').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Administrator').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Applicant').parentElement?.previousSibling
    ).toBeChecked();
  });

  test('Should redirect to change department page as User who is being newly promoted to ADMIN', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: ['3', '4'] });
    mockGetUserById.mockResolvedValue(
      getMockUser([getMockRoles()[0], getMockRoles()[1]])
    );
    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(result).toEqual({
      redirect: {
        //new roles query param passed in to be used in change department page
        destination: `/super-admin-dashboard/user/1/change-department?newRoles=1,2,3,4`,
        statusCode: 302,
      },
    });
  });

  test('Should redirect to account overview page as User who is being promoted to APPLICANT', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: ['1', '2'] });
    mockGetUserById.mockResolvedValue(
      getMockUser([getMockRoles()[0], getMockRoles()[1]])
    );
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

  test('Should redirect to account page as ADMIN user (with a department) being promoted to SUPER ADMIN', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: ['4'] });
    mockGetUserById.mockResolvedValue(
      getMockUser([getMockRoles()[0], getMockRoles()[1], getMockRoles()[2]], {
        id: '1',
        name: 'Test Department',
      })
    );
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
