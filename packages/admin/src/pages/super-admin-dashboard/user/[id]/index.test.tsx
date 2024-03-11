import { render, screen } from '@testing-library/react';
import UserPage, { getServerSideProps } from './index.page';
import InferProps from '../../../../types/InferProps';
import { getPageProps } from '../../../../testUtils/unitTestHelpers';
import { Optional, getContext, mockServiceMethod } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import {
  getUserById,
  getUserFromJwt,
} from '../../../../services/SuperAdminService';
import { User } from '../../types';
import { getAdminsSchemes } from '../../../../services/SchemeService';
import moment from 'moment';

jest.mock('../../../../services/SuperAdminService');
jest.mock('../../../../services/SchemeService');

describe('Super admin - Edit user page', () => {
  describe('UI', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      gapUserId: '1',
      emailAddress: 'test@gmail.com',
      sub: 'sub',
      roles: [
        {
          name: 'ADMIN',
          label: 'Admin',
          description: 'Admin',
          id: 'ADMIN',
        },
      ],
      role: {
        name: 'ADMIN',
        label: 'Admin',
        description: 'Admin',
        id: '1',
      },
      department: {
        id: '1',
        name: 'Cabinet Office',
      },
      colaSub: 'colaSub',
      created: new Date().toISOString(),
      isViewingOwnAccount: false,
      isUserAdmin: true,
      schemes: [],
    });

    it('Should render a back button', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/super-admin-dashboard'
      );
    });

    it('Should render an applicants user details', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, {
            role: {
              label: 'Applicant',
            },
          })}
        />
      );

      expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/change-roles?isOwner=false'
      );
    });

    it('Should render an admins user details', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      const changeLinks = screen.getAllByRole('link', { name: 'Change' });
      expect(changeLinks[0]).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/change-roles?isOwner=false'
      );
      expect(changeLinks[1]).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/change-department'
      );
    });

    it('Should render a created date', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      screen.getByText(moment(new Date().toISOString()).format('DD MMMM YYYY'));
    });

    it('Should not render a created date when there isnt one', () => {
      render(<UserPage {...getPageProps(getDefaultProps, { created: '' })} />);

      expect(
        screen.queryByText(
          moment(new Date().toISOString()).format('DD MMMM YYYY')
        )
      ).toBeNull();
      screen.getByText('-');
    });

    it('Should not render grant ownership if user is an applicant', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, {
            created: '',
            isUserAdmin: false,
            schemes: [],
          })}
        />
      );

      expect(screen.queryByText('Grants this user owns')).toBeNull();
      expect(
        screen.queryByText('This user does not own any grants.')
      ).toBeNull();
      expect(screen.queryByRole('link', { name: 'Change owner' })).toBeNull();
    });

    it('Should render grant ownership if user is an admin', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, {
            created: '',
            isUserAdmin: true,
          })}
        />
      );

      expect(screen.queryByText('Grants this user owns')).toBeDefined();
      expect(
        screen.queryByText('This user does not own any grants.')
      ).toBeDefined();
      expect(
        screen.queryByRole('link', { name: 'Change owner' })
      ).toBeDefined();
    });

    it('Should render grant ownership if user is an applicant but previosuly owned grants', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, {
            created: '',
            isUserAdmin: false,
            schemes: [{ name: 'Test Scheme', schemeId: 'schemeId' }],
          })}
        />
      );

      expect(screen.queryByText('Grants this user owns')).toBeDefined();
      expect(
        screen.queryByText('This user does not own any grants.')
      ).toBeNull();
      expect(
        screen.queryByRole('link', { name: 'Change owner' })
      ).toBeDefined();
    });

    it('Should render a users schemes', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, {
            schemes: [{ name: 'Test Scheme', schemeId: 'schemeId' }],
          })}
        />
      );

      const changeLinks = screen.getAllByRole('link', { name: 'Change' });
      //they own the grant
      expect(changeLinks[0]).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/change-roles?isOwner=true'
      );

      expect(
        screen.getByRole('link', { name: 'Change owner' })
      ).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/schemes/schemeId/change-owner?oldEmailAddress=test%40gmail.com&schemeName=Test+Scheme'
      );

      expect(
        screen.queryByText('This user does not own any grants.')
      ).toBeNull();
    });

    it('Should render no schemes when there are none', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      screen.getByText('This user does not own any grants.');
      expect(screen.queryByRole('link', { name: 'Change owner' })).toBeNull();
    });

    it('renders a delete user button in disabled state when user does not have schemes', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      const deleteUserButton = screen.getByRole('link', {
        name: 'Delete user',
      });

      expect(deleteUserButton).toHaveAttribute(
        'href',
        '/apply/super-admin-dashboard/user/1/delete-user'
      );
      expect(deleteUserButton).toBeEnabled();
    });

    it('renders delete user button in disabled state when user has schemes', () => {
      const props = {
        ...getPageProps(getDefaultProps),
        schemes: [
          {
            name: 'Test Scheme',
            schemeId: 'schemeId',
            ggisReference: 'reference',
            funderId: 'someid',
            createdDate: 'many eons ago',
          },
        ],
      };
      render(<UserPage {...props} />);

      const deleteUserButton = screen.getByRole('button', {
        name: 'Delete user',
      });

      expect(deleteUserButton).toBeDisabled();
    });

    it('Should render an unblock user button', () => {
      render(
        <UserPage {...getPageProps(getDefaultProps, { role: { label: '' } })} />
      );

      expect(
        screen.getByRole('link', { name: 'Unblock user' })
      ).toHaveAttribute('href', '/apply/api/unblockUser?id=1');
      expect(screen.queryByRole('link', { name: 'Block user' })).toBeNull();
    });

    it('Should render a block user button', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Block user' })).toHaveAttribute(
        'href',
        '/apply/super-admin-dashboard/user/1/block-user'
      );
      expect(screen.queryByRole('link', { name: 'Unblock user' })).toBeNull();
    });

    it('Should not render delete/block/unblock when viewing own account', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, { isViewingOwnAccount: true })}
        />
      );

      expect(screen.queryByRole('link', { name: 'Delete user' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Unblock user' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Block user' })).toBeNull();
    });
  });

  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        id: '1',
      },
      req: {
        cookies: {
          'user-service-token': 'jwt',
          sessionId: 'testSessionId',
        },
      },
    });

    const mockedGetUserFromJwt = jest.mocked(getUserFromJwt);
    const mockedGetUserById = jest.mocked(getUserById);
    const mockedGetAdminsSchemes = jest.mocked(getAdminsSchemes);

    const user: User = {
      gapUserId: '1',
      emailAddress: 'test@gmail.com',
      sub: 'sub',
      roles: [
        {
          name: 'ADMIN',
          label: 'Admin',
          description: 'Admin',
          id: 'ADMIN',
        },
      ],
      role: {
        name: 'ADMIN',
        label: 'Admin',
        description: 'Admin',
        id: '1',
      },
      department: {
        id: '1',
        name: 'Cabinet Office',
      },
      created: 'now',
    };

    beforeEach(() => {
      mockServiceMethod(mockedGetUserFromJwt, () => user);
      mockServiceMethod(mockedGetUserById, () => ({ ...user, gapUserId: '2' }));
      mockServiceMethod(mockedGetAdminsSchemes, () => [{ name: 'Test' }]);
    });

    it('Should fetch user details from jwt when viewing self', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(mockedGetUserFromJwt).toHaveBeenNthCalledWith(1, 'jwt');
      expect(result.props).toEqual(expect.objectContaining(user));
    });

    it('Should fetch user details from id when viewing other user', async () => {
      const result = await getServerSideProps(
        getContext(getDefaultContext, { params: { id: '2' } })
      );

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(mockedGetUserById).toHaveBeenNthCalledWith(1, '2', 'jwt');
      expect(result.props).toEqual(
        expect.objectContaining({ ...user, gapUserId: '2' })
      );
    });

    it('Should fetch users schemes', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(mockedGetAdminsSchemes).toHaveBeenNthCalledWith(
        1,
        'sub',
        'testSessionId'
      );
      expect(result.props).toEqual(
        expect.objectContaining({ schemes: [{ name: 'Test' }] })
      );
    });

    it('Should return isViewingOwnAccount', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props).toEqual(
        expect.objectContaining({ isViewingOwnAccount: true })
      );
    });

    it('Should return isViewingOwnAccount as false when viewing other user', async () => {
      const result = await getServerSideProps(
        getContext(getDefaultContext, { params: { id: '2' } })
      );

      if ('redirect' in result) throw new Error('Should not redirect');

      expect(result.props).toEqual(
        expect.objectContaining({ isViewingOwnAccount: false })
      );
    });

    it('Should redirect to login page when getUserFromJwt not authed', async () => {
      mockedGetUserFromJwt.mockRejectedValue(new Error('Error'));
      process.env.LOGIN_URL = 'login-url';

      const result = await getServerSideProps(getContext(getDefaultContext));

      expect(result).toEqual(
        expect.objectContaining({
          redirect: {
            destination: 'login-url',
            permanent: false,
          },
        })
      );
    });

    it('Should redirect to login page when getUserById not authed', async () => {
      mockedGetUserById.mockRejectedValue(new Error('Error'));
      process.env.LOGIN_URL = 'login-url';

      const result = await getServerSideProps(
        getContext(getDefaultContext, { params: { id: '2' } })
      );

      expect(result).toEqual(
        expect.objectContaining({
          redirect: {
            destination: 'login-url',
            permanent: false,
          },
        })
      );
    });

    it('Should redirect to login page when getAdminsSchemes not authed', async () => {
      mockedGetAdminsSchemes.mockRejectedValue(new Error('Error'));
      process.env.LOGIN_URL = 'login-url';

      const result = await getServerSideProps(getContext(getDefaultContext));

      expect(result).toEqual(
        expect.objectContaining({
          redirect: {
            destination: 'login-url',
            permanent: false,
          },
        })
      );
    });
  });
});
