import { render, screen } from '@testing-library/react';
import UserPage, { getServerSideProps } from './index.page';
import InferProps from '../../../../types/InferProps';
import { getPageProps } from '../../../../testUtils/unitTestHelpers';

describe('Super admin - Edit user page', () => {
  describe('UI', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      schemes: [],
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
      isViewingOwnAccount: false,
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
        '/super-admin-dashboard/user/1/change-roles'
      );
    });

    it('Should render an admins user details', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      const changeLinks = screen.getAllByRole('link', { name: 'Change' });
      expect(changeLinks[0]).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/change-department'
      );
      expect(changeLinks[1]).toHaveAttribute(
        'href',
        '/super-admin-dashboard/user/1/change-roles'
      );
    });

    it('Should render a users schemes', () => {
      render(
        <UserPage
          {...getPageProps(getDefaultProps, { schemes: [{ name: 'Test' }] })}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Change owner' })
      ).toHaveAttribute('href', '/super-admin-dashboard/user/1/change-owner');

      expect(
        screen.queryByText('This user does not own any grants')
      ).toBeNull();
    });

    it('Should render no schemes when there are none', () => {
      render(<UserPage {...getPageProps(getDefaultProps)} />);

      screen.getByText('This user does not own any grants');
      expect(screen.queryByRole('link', { name: 'Change owner' })).toBeNull();
    });
  });
});
