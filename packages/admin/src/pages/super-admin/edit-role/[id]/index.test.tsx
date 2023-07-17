import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EditRoleWithId from './index.page';
import UserDetails from '../../../../types/UserDetails';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});

const getMockRoles = () => [
  { id: '1', name: 'Find', description: 'this is a description' },
  {
    id: '2',
    name: 'Super admin',
    description: 'this is a super admin description',
  },
  { id: '3', name: 'Admin', description: 'this is anopther description' },
  { id: '4', name: 'Apply', description: 'this is anopther description' },
];

const getMockUser = (): UserDetails => ({
  firstName: 'john',
  lastName: 'm',
  organisationName: 'tco',
  emailAddress: 'superAdmin@and.digital',
  roles: [getMockRoles()[0], getMockRoles()[1]],
});

const component = (
  <EditRoleWithId
    resolvedUrl="."
    roles={getMockRoles()}
    user={getMockUser()}
    csrfToken="csrf"
    id={1}
  />
);

describe('Edit role page', () => {
  test('Should only check input roles which the queried user has', () => {
    render(component);
    expect(
      screen.getByText('Find').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Super admin').parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Admin').parentElement?.previousSibling
    ).not.toBeChecked();
    expect(
      screen.getByText('Apply').parentElement?.previousSibling
    ).not.toBeChecked();
  });
});
