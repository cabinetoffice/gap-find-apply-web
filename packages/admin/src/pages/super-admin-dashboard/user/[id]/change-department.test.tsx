import '@testing-library/jest-dom';
import { parseBody } from 'next/dist/server/api-utils/node';
import { getContext } from 'gap-web-ui';
import UserPage, { getServerSideProps } from './change-department.page';
import { Department, Role, User } from '../../types';
import { render, screen } from '@testing-library/react';
import {
  getChangeDepartmentPage,
  updateUserRoles,
} from '../../../../services/SuperAdminService';

jest.mock('next/dist/server/api-utils/node', () => ({
  ...jest.requireActual('next/dist/server/api-utils/node'),
  parseBody: jest.fn(),
}));

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(),
  updateDepartment: jest.fn(),
  updateUserRoles: jest.fn(),
  getChangeDepartmentPage: jest.fn(),
  getAllDepartments: async () => getMockDepartment(),
}));

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

const getMockDepartment = (): Department => ({
  id: '1',
  name: 'Test Department',
});

const getMockUser = (
  roles: Role[] = [getMockRoles()[0], getMockRoles()[3]]
): User => ({
  gapUserId: 'mockId',
  sub: 'sub',
  colaSub: 'colaSub',
  emailAddress: 'test.superadmin@gmail.com',
  roles: roles,
  department: getMockDepartment(),
  created: 'NULL',
});

describe('Change department page', () => {
  beforeEach(jest.clearAllMocks);
  describe('UserPage component', () => {
    test('Should render the correct content', () => {
      const component = (
        <UserPage
          csrfToken="csrf"
          pageData={{
            user: getMockUser(),
            departments: [getMockDepartment()],
          }}
          formAction="."
          fieldErrors={[]}
          previousValues={{ department: '1' }}
        />
      );
      render(component);
      expect(
        screen.getByRole('heading', { name: "Change the user's department" })
      ).toBeVisible();
      expect(screen.getByText('Test Department')).toBeVisible();
      expect(
        screen.getByText('Test Department').previousSibling
      ).toHaveAttribute('type', 'radio');
      expect(screen.getByText('Change department')).toBeVisible();
      expect(screen.getByText('Manage departments')).toBeVisible();
    });

    test('Should throw an error if no department is selected', async () => {
      const component = (
        <UserPage
          csrfToken="csrf"
          pageData={{
            user: getMockUser(),
            departments: [getMockDepartment()],
          }}
          formAction="."
          fieldErrors={[
            { fieldName: 'department', errorMessage: 'Select a department' },
          ]}
          previousValues={{ department: '1' }}
        />
      );
      render(component);
      expect(screen.getByText('There is a problem')).toBeVisible();
      expect(
        screen.getByText('There is a problem').nextSibling
      ).toHaveTextContent('Select a department');
    });
  });

  describe('getServerSideProps', () => {
    const mockGetChangeDepartmentPage = jest.mocked(getChangeDepartmentPage);
    const mockParseBody = jest.mocked(parseBody);
    test('Should redirect to user page if department is selected', async () => {
      mockGetChangeDepartmentPage.mockResolvedValueOnce({
        user: getMockUser(),
        departments: [{ id: '4', name: 'hello world' }],
      });
      mockParseBody.mockResolvedValueOnce({ department: 'fake department' });
      const getDepartmentSelectedContext = () => ({
        params: { id: 'someId' },
        req: { method: 'POST' },
      });
      const result = await getServerSideProps(
        getContext(getDepartmentSelectedContext)
      );
      expect(result).toEqual({
        redirect: {
          destination: '/super-admin-dashboard/user/someId',
          statusCode: 302,
        },
      });
    });

    test('Should update roles if user is being promoted to ADMIN', async () => {
      mockGetChangeDepartmentPage.mockResolvedValueOnce({
        user: getMockUser([getMockRoles()[0], getMockRoles()[1]]),
        departments: [{ id: '4', name: 'hello world' }],
      });
      mockParseBody.mockResolvedValueOnce({ department: 'fake department' });
      const getDepartmentSelectedContext = () => ({
        params: { id: 'someId' },
        query: { newRoles: '3, 4' },
        req: { method: 'POST' },
      });
      const result = await getServerSideProps(
        getContext(getDepartmentSelectedContext)
      );
      expect(result).toEqual({
        redirect: {
          destination: '/super-admin-dashboard/user/someId',
          statusCode: 302,
        },
      });
      expect(updateUserRoles).toHaveBeenCalledWith('someId', ['3', ' 4'], '');
    });
  });
});
