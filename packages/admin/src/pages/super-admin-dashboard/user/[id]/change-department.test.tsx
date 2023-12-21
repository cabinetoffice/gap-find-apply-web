import '@testing-library/jest-dom';
import { parseBody } from 'next/dist/server/api-utils/node';
import UserPage from './change-department.page';
import { Department } from '../../types';
import { render, screen } from '@testing-library/react';
import { User } from '../../types';
import {
  getUserById,
  updateDepartment,
} from '../../../../services/SuperAdminService';

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(),
  updateDepartment: jest.fn(),
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

const getMockUser = (): User => ({
  gapUserId: 'mockId',
  sub: 'sub',
  emailAddress: 'test.superadmin@gmail.com',
  roles: [getMockRoles()[0], getMockRoles()[3]],
  department: null,
  created: 'NULL',
});

describe('Change department page', () => {
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
    expect(screen.getByText('Test Department').previousSibling).toHaveAttribute(
      'type',
      'radio'
    );
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

  test('Should redirect to user page if department is selected', async () => {
    // TODO: Implement this unit test (involves mocking similar to that seen in change-roles.test.tsx)
  });
});
