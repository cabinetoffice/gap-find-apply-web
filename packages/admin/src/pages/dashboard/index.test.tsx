import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Scheme from '../../types/Scheme';
import Dashboard, { getServerSideProps } from './index.page';
import { getUserSchemes } from '../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../services/UserService';
import UserDetails from '../../types/UserDetails';
import InferProps from '../../types/InferProps';
import { Optional, expectObjectEquals, getContext, getProps } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';

jest.mock('../../services/SchemeService');
jest.mock('../../services/UserService');

const mockSchemeList: Scheme[] = [
  {
    name: 'Scheme name 1',
    schemeId: '123',
    ggisReference: 'ggisReference',
    funderId: '24356',
    createdDate: '2011-12-10T14:48:00',
  },
  {
    name: 'Scheme name 2',
    schemeId: '456',
    ggisReference: 'ggisReference',
    funderId: '26456',
    createdDate: '2011-10-10T14:48:00',
  },
];

const mockUserDetails: UserDetails = {
  firstName: 'Test',
  lastName: 'User',
  emailAddress: 'test@email.com',
  roles: [{ id: '1', name: 'APPLY', description: 'desc' }],
  organisationName: 'Testing Org',
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
    });

    it('Should return a list of schemes', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        props: {
          schemes: mockSchemeList,
          userDetails: mockUserDetails,
          oneLoginTransferErrorEnabled: false,
          migrationSucceeded: undefined,
        },
      });
    });

    it('Should return oneLoginTransferErrorEnabled = true', async () => {
      process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED = 'true';

      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        props: {
          schemes: mockSchemeList,
          userDetails: mockUserDetails,
          oneLoginTransferErrorEnabled: true,
          migrationSucceeded: undefined,
        },
      });
    });
  });

  describe('Dashboard page render', () => {
    function getDefaultProps(): InferProps<typeof getServerSideProps> {
      return {
        schemes: mockSchemeList,
        oneLoginTransferErrorEnabled: false,
        userDetails: mockUserDetails,
        migrationSucceeded: 'false',
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
            oneLoginTransferErrorEnabled: true,
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

    it('Should render the success banner', () => {
      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            oneLoginTransferErrorEnabled: true,
            migrationSucceeded: 'true',
          })}
        />
      );

      screen.getByRole('heading', { level: 2, name: 'Success' });
      screen.getByText(
        'Your data has been successfully added to your One Login account.'
      );
    });

    it('Should not render the success banner', () => {
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

      screen.getByRole('cell', { name: '10 December 2011' });
      screen.getByRole('cell', { name: '10 October 2011' });
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

    it('Should render a View all schemes link to the schemes page when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      const viewAllSchemesElement = screen.getByRole('link', {
        name: 'View all grants',
      });
      expect(viewAllSchemesElement).toHaveAttribute(
        'href',
        '/apply/scheme-list'
      );
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
