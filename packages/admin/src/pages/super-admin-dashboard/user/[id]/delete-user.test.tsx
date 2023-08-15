import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextRouter } from 'next/router';
import { getContext } from 'gap-web-ui';
import { deleteUserInformation } from '../../../../services/SuperAdminService';
import DeleteUserPage, { getServerSideProps } from './delete-user.page';
import { renderWithRouter } from '../../../../testUtils/unitTestHelpers';

jest.mock('next/dist/server/api-utils/node', () => ({
  parseBody: () => ({}),
}));

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(() => Promise.resolve({ statusCode: 200 })),
  deleteUserInformation: jest.fn(),
}));

const mockPageData = {
  user: {
    firstName: 'testFirstName',
    lastName: 'testLastName',
    organisationName: 'tco',
    emailAddress: 'test@test.com',
    roles: [],
  },
  userId: '1',
  _csrf: '',
};

const renderComponent = () =>
  renderWithRouter(
    <DeleteUserPage
      previousValues={mockPageData}
      formAction="."
      pageData={mockPageData}
      csrfToken="csrf"
      fieldErrors={[]}
    />
  );

describe('Delete user information page', () => {
  it('renders email address and expected content', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'Delete a user' })
    ).toBeVisible();
    expect(
      screen.getByText(
        `If you delete this user's account, all of their data will be lost. You cannot undo this action.`
      )
    ).toBeVisible();
    expect(screen.getByText('test@test.com')).toBeVisible();
  });
});

describe('Block user page functionality', () => {
  it('back and cancel buttons link to user page', async () => {
    const expectedUrl = '/super-admin-dashboard/user/1';
    const assertReturnedToUserPage = async (router: NextRouter) =>
      waitFor(() =>
        expect(router.push).toHaveBeenCalledWith(
          expectedUrl,
          expectedUrl,
          expect.any(Object)
        )
      );
    const { router } = renderComponent();

    userEvent.click(screen.getByText('Back'));
    await assertReturnedToUserPage(router);

    jest.clearAllMocks();
    userEvent.click(screen.getByText('Cancel'));
    await assertReturnedToUserPage(router);
  });

  it('POST request to getServerSideProps calls deleteUserInformation', async () => {
    const context = getContext(() => ({
      req: {
        method: 'POST',
        body: {},
      },
      params: { userId: '1234' },
    }));

    const response = await getServerSideProps(context);
    expect(deleteUserInformation).toHaveBeenCalled();
    expect(response).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/',
        statusCode: 302,
      },
    });
  });
});
