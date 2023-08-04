import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BlockUserPage from './block-user.page';
import { updateUserRoles } from '../../../../services/SuperAdminService';
import { waitFor } from '@testing-library/dom';
import { RouterContext } from 'next/dist/shared/lib/router-context';

jest.mock('../../../../services/SuperAdminService');

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
  <RouterContext.Provider value={}>
    <BlockUserPage
      previousValues={mockPageData}
      formAction="."
      pageData={mockPageData}
      csrfToken="csrf"
      fieldErrors={[]}
    />
  </RouterContext.Provider>
);

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
    expect(screen.getByText('Cancel').parentElement).toHaveAttribute(
      'href',
      '/apply/super-admin-dashboard/user/1'
    );
  });

  test('Block button should have call updateUserRoles', async () => {
    render(component);
    expect(updateUserRoles).toHaveBeenCalledTimes(0);
    await waitFor(() => screen.getByText('Block user').click());
  });
});
