import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BlockUserPage from './block-user.page';
import { updateUserRoles } from '../../../../services/SuperAdminService';
import { waitFor } from '@testing-library/react';

const mockPageData = {
  user: {
    firstName: 'testFirstName',
    lastName: 'testLastName',
    organisationName: 'tco',
    emailAddress: 'test@test.com',
    roles: [],
  },
  userId: '1',
};

const component = (
  <BlockUserPage
    previousValues={mockPageData}
    formAction="."
    pageData={mockPageData}
    csrfToken="csrf"
    fieldErrors={[]}
  />
);

jest.mock('../../../../services/SuperAdminService');
const mockedUserRoles = jest.mocked(updateUserRoles);

describe('Block user information page', () => {
  test('Email address should be rendered on the page', async () => {
    render(component);
    expect(screen.getByText('test@test.com'));
  });
});

describe('Block user page functionality', () => {
  test('Back button should redirect to user page', async () => {
    render(component);
    expect(screen.getByText('Back')).toHaveAttribute(
      'href',
      '/apply/super-admin-dashboard/user/1'
    );
  });

  test('Cancel button should redirect to user page', async () => {
    render(component);
    expect(screen.getByDisplayValue('Cancel')).toHaveAttribute(
      'href',
      '/apply/super-admin-dashboard/user/1'
    );
  });

  test('Form action hits the SuperAdminService update usser roles', async () => {
    render(component);
    screen.getByText('Block user').click();
    await waitFor(() => expect(mockedUserRoles).toHaveBeenCalled());
  });
});
