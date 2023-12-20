import '@testing-library/jest-dom';
import { deprecationHandler } from 'moment';
import UserPage from './change-department.page';
import { Department } from '../../types';
import { render, screen } from '@testing-library/react';
import { User } from '../../types';

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
  department: getMockDepartment(),
  created: 'NULL',
});

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

describe('Change department page', () => {
  test('Should render the correct content', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: "Change the user's department" })
    ).toBeVisible();
    expect(screen.getByText('Test Department')).toBeVisible();
    expect(screen.getByText('Test Department').previousSibling).toHaveAttribute(
      'checked'
    );
    expect(screen.getByText('Change department')).toBeVisible();
    expect(screen.getByText('Manage departments')).toBeVisible();
  });
});
