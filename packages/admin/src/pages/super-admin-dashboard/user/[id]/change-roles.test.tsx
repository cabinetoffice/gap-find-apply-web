import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EditRoleWithId from './change-roles.page';
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
    name: 'SUPER_ADMIN',
    description: 'this is a super admin description',
    label: 'Super administrator',
  },
  {
    id: '3',
    name: 'ADMIN',
    description: 'this is another description',
    label: 'Administrator',
  },
  {
    id: '4',
    name: 'APPLICANT',
    description: 'this is another description',
    label: 'Applicant',
  },
];

const getMockUser = (): User => ({
  gapUserId: 'john',
  sub: 'sub',
  emailAddress: 'superAdmin@and.digital',
  roles: [getMockRoles()[0], getMockRoles()[1]],
  created: '2023-11-27 14:23:42.641781',
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
});
