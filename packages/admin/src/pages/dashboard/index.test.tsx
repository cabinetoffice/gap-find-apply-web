import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Optional, expectObjectEquals, getContext, getProps } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import { getUserSchemes } from '../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../services/UserService';
import InferProps from '../../types/InferProps';
import Scheme from '../../types/Scheme';
import UserDetails from '../../types/UserDetails';
import Dashboard, { getServerSideProps } from './index.page';

jest.mock('../../services/SchemeService');
jest.mock('../../services/UserService');

const mockSchemeList: Scheme[] = [
  {
    name: 'Scheme name 1',
    schemeId: '123',
    ggisReference: 'ggisReference',
    funderId: '24356',
    createdDate: '2011-12-10T14:48:00',
    lastUpdatedDate: '2011-12-10T15:50:00',
    lastUpdatedBy: 'test@email.com',
  },
  {
    name: 'Scheme name 2',
    schemeId: '456',
    ggisReference: 'ggisReference',
    funderId: '26456',
    createdDate: '2011-10-10T16:48:00',
    lastUpdatedDate: '2011-12-10T14:48:00',
    lastUpdatedBy: 'test2@email.com',
  },
];

const mockUserDetails: UserDetails = {
  firstName: 'Test',
  lastName: 'User',
  emailAddress: 'test@email.com',
  roles: '[FIND, APPLICANT, ADMIN]',
  organisationName: 'Testing Org',
  created: '2003-01-13T00:00:00',
};

describe('Dashboard', () => {
  describe('getServerSideProps', () => {
    const mockedGetUserSchemes = jest.mocked(getUserSchemes);
    const mockedGetLoggedInUsersDetails = jest.mocked(getLoggedInUsersDetails);

    function getDefaultContext(): Optional<GetServerSidePropsContext> {
      return {};
    }

    beforeEach(() => {
      mockedGetUserSchemes.mockResolvedValue(mockSchemeList);
      mockedGetLoggedInUsersDetails.mockResolvedValue(mockUserDetails);
      process.env.SESSION_COOKIE_NAME = 'gap-test';
      process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED = 'false';
    });

    it('Should return a list of schemes', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        props: {
          schemes: mockSchemeList,
          userDetails: mockUserDetails,
          bannerProps: null,
          isTechSupportUser: false,
        },
      });
    });
  });

  describe('Dashboard page render', () => {
    function getDefaultProps(): InferProps<typeof getServerSideProps> {
      return {
        schemes: mockSchemeList,
        bannerProps: null,
        userDetails: mockUserDetails,
      };
    }

    it('Should render a page title', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByRole('heading', { name: 'Manage a grant' });
    });

    it('Should render the error banner', () => {
      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            bannerProps: 'FAILED',
          })}
        />
      );

      screen.getByRole('heading', { level: 2, name: 'Important' });
      screen.getByText('Something went wrong while transferring your data.');
      expect(
        screen.getByRole('link', {
          name: 'findagrant@cabinetoffice.gov.uk',
        })
      ).toHaveAttribute('href', 'mailto:findagrant@cabinetoffice.gov.uk');
    });

    it('Should not render the error banner', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.queryByRole('heading', { level: 2, name: 'Important' })
      ).toBeFalsy();
    });

    it(`renders success banner when migrationSucceeded is 'true'`, () => {
      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            bannerProps: {
              bannerHeading:
                'Your data has been successfully added to your One Login account.',
              isSuccess: true,
            },
          })}
        />
      );

      screen.getByRole('heading', { level: 2, name: 'Success' });
      screen.getByText(
        'Your data has been successfully added to your One Login account.'
      );
    });

    it('does not render success banner when migrationSucceeded not passed', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.queryByRole('heading', { level: 2, name: 'Success' })
      ).toBeFalsy();
    });

    it('Should render the user email', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByText('test@email.com');
    });

    it('Should render the organisation name', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByText('Testing Org');
    });

    it('Should render the "manage your grant scheme table" headings when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByRole('columnheader', { name: 'Name' });
      screen.getByRole('columnheader', { name: 'Date created' });
    });

    it('Should render the "manage your grant scheme table" scheme names when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByRole('cell', { name: 'Scheme name 1' });
      screen.getByRole('cell', { name: 'Scheme name 2' });
    });

    it('Should render the "manage your grant scheme table" scheme created at dates when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByRole('cell', { name: 'Saturday 10 December 2011, 2:48 pm' });
      screen.getByRole('cell', { name: 'Monday 10 October 2011, 2:48 pm' });
    });

    it('Should render the "manage your grant scheme table" scheme view links when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.getByRole('link', { name: 'View scheme Scheme name 1' })
      ).toHaveAttribute('href', '/apply/scheme/123');
      expect(
        screen.getByRole('link', { name: 'View scheme Scheme name 2' })
      ).toHaveAttribute('href', '/apply/scheme/456');
    });

    it('Should NOT render the "create new grant scheme" section when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.queryByTestId('create-new-grant-scheme-section')
      ).toBeFalsy();
    });

    it('Should NOT render the "manage your grant scheme table" when there are no schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps, { schemes: [] })} />);

      const manageGrantSchemeTable = screen.queryByTestId(
        'manage-grant-scheme-table'
      );
      expect(manageGrantSchemeTable).toBeFalsy();
    });

    it('Should render the "create new grant scheme" section when there are no schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps, { schemes: [] })} />);

      screen.getByRole('heading', { name: 'Add grant details' });
      screen.getByText('Start by adding the details of your grant.');
      screen.getByRole('button', { name: 'Add a grant' });
    });

    it('Should NOT render the "create new grant scheme" side bar when there are no schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps, { schemes: [] })} />);

      expect(
        screen.queryByText('Create new grant schemes to advertise your grants.')
      ).toBeFalsy();
      expect(
        screen.queryByTestId('create-new-grant-scheme-sidebar')
      ).toBeFalsy();
    });

    it('Should NOT render a View all schemes link to the schemes page when there are no schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps, { schemes: [] })} />);

      expect(
        screen.queryByRole('link', { name: 'View all schemes' })
      ).toBeFalsy();
    });
  });
});
