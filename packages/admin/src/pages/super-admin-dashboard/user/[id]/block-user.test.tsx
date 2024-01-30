import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextRouter } from 'next/router';
import { getContext } from 'gap-web-ui';
import { updateUserRoles } from '../../../../services/SuperAdminService';
import BlockUserPage, { getServerSideProps } from './block-user.page';
import { renderWithRouter } from '../../../../testUtils/unitTestHelpers';

jest.mock('../../../../utils/parseBody', () => ({
  parseBody: () => ({}),
}));

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(() => Promise.resolve({ statusCode: 200 })),
  getUserFromJwt: jest.fn(),
  updateUserRoles: jest.fn(),
}));

const getMockPageData = (gapUserId: string, isViewingOwnAccount: boolean) => ({
  isViewingOwnAccount,
  user: {
    gapUserId,
    created: 'rn',
    sub: 'za',
    firstName: 'testFirstName',
    lastName: 'testLastName',
    organisationName: 'tco',
    emailAddress: 'test@test.com',
    roles: [],
  },
  userId: '1',
  _csrf: '',
});

const renderComponent = (gapUserId = '2', isViewingOwnAccount = false) => {
  const mockPageData = getMockPageData(gapUserId, isViewingOwnAccount);
  return renderWithRouter(
    <BlockUserPage
      previousValues={mockPageData}
      formAction="."
      pageData={mockPageData}
      csrfToken="csrf"
      fieldErrors={[]}
    />
  );
};

describe('Block user information page', () => {
  it('renders email address and expected content', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: 'Block a user' })).toBeVisible();
    expect(
      screen.getByText(
        `Blocking this user will remove their access to Find a grant, but they will stay listed in the database and can be unblocked later. Their roles will be reset and will need to be restored manually.`
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

  it('POST request to getServerSideProps calls updateUserRoles', async () => {
    const context = getContext(() => ({
      req: { method: 'POST', body: {} },
      params: { userId: '1234', id: '1' },
    }));

    const response = await getServerSideProps(context);
    expect(updateUserRoles).toHaveBeenCalled();
    expect(response).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1',
        statusCode: 302,
      },
    });
  });

  it('should not render the block button when a super admin is viewing their own account', () => {
    renderComponent('1', true);

    expect(screen.queryByText('Block user')).not.toBeInTheDocument();
    expect(screen.queryByText('You cannot block your account.')).toBeVisible();
  });
});
