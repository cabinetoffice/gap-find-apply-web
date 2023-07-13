import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Scheme from '../../types/Scheme';
import Dashboard, { getServerSideProps } from './index.page';
import { getUserSchemes } from '../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../services/UserService';
import UserDetails from '../../types/UserDetails';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
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
  emailAddress: 'test',
  roles: [{ id: "1", name: "APPLY", description: 'desc' }], 
  organisationName: 'Testing Org',
};

describe('Dashboard', () => {
  describe('getServerSideProps', () => {
    const mockedGetUserSchemes = getUserSchemes as jest.MockedFn<
      typeof getUserSchemes
    >;

    const mockedGetLoggedInUsersDetails =
      getLoggedInUsersDetails as jest.MockedFn<typeof getLoggedInUsersDetails>;

    it('Should return a list of schemes', async () => {
      mockedGetUserSchemes.mockResolvedValue(mockSchemeList);
      mockedGetLoggedInUsersDetails.mockResolvedValue(mockUserDetails);

      process.env.SESSION_COOKIE_NAME = 'gap-test';

      const result = await getServerSideProps({
        req: { cookies: { 'gap-test': 'testSessionId' } },
      } as any);

      expect(result).toStrictEqual({
        props: { schemes: mockSchemeList, userDetails: mockUserDetails },
      });
    });
  });

  describe('Dashboard page render', () => {
    it('Should render a page title', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      screen.getByRole('heading', { name: 'Manage a grant' });
    });

    it('Should render the user name', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      screen.getByText('Test User');
    });

    it('Should render the organisation name', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      screen.getByText('Testing Org');
    });

    it('Should render the "manage your grant scheme table" headings when there are schemes', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      screen.getByRole('columnheader', { name: 'Name' });
      screen.getByRole('columnheader', { name: 'Date created' });
    });

    it('Should render the "manage your grant scheme table" scheme names when there are schemes', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      screen.getByRole('cell', { name: 'Scheme name 1' });
      screen.getByRole('cell', { name: 'Scheme name 2' });
    });

    it('Should render the "manage your grant scheme table" scheme created at dates when there are schemes', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      screen.getByRole('cell', { name: '10 December 2011' });
      screen.getByRole('cell', { name: '10 October 2011' });
    });

    it('Should render the "manage your grant scheme table" scheme view links when there are schemes', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      expect(
        screen.getByRole('link', { name: 'View scheme Scheme name 1' })
      ).toHaveAttribute('href', '/scheme/123');
      expect(
        screen.getByRole('link', { name: 'View scheme Scheme name 2' })
      ).toHaveAttribute('href', '/scheme/456');
    });

    it('Should render a View all schemes link to the schemes page when there are schemes', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      const viewAllSchemesElement = screen.getByRole('link', {
        name: 'View all grants',
      });
      expect(viewAllSchemesElement).toHaveAttribute('href', '/scheme-list');
    });

    it('Should NOT render the "create new grant scheme" section when there are schemes', () => {
      render(
        <Dashboard schemes={mockSchemeList} userDetails={mockUserDetails} />
      );
      expect(
        screen.queryByTestId('create-new-grant-scheme-section')
      ).toBeFalsy();
    });

    it('Should NOT render the "manage your grant scheme table" when there are no schemes', () => {
      render(<Dashboard schemes={[]} userDetails={mockUserDetails} />);
      const manageGrantSchemeTable = screen.queryByTestId(
        'manage-grant-scheme-table'
      );
      expect(manageGrantSchemeTable).toBeFalsy();
    });

    it('Should render the "create new grant scheme" section when there are no schemes', () => {
      render(<Dashboard schemes={[]} userDetails={mockUserDetails} />);
      screen.getByRole('heading', { name: 'Add grant details' });
      screen.getByText('Start by adding the details of your grant.');
      screen.getByRole('button', { name: 'Add a grant' });
    });

    it('Should NOT render the "create new grant scheme" side bar when there are no schemes', () => {
      render(<Dashboard schemes={[]} userDetails={mockUserDetails} />);
      expect(
        screen.queryByText('Create new grant schemes to advertise your grants.')
      ).toBeFalsy();
      expect(
        screen.queryByTestId('create-new-grant-scheme-sidebar')
      ).toBeFalsy();
    });

    it('Should NOT render a View all schemes link to the schemes page when there are no schemes', () => {
      render(<Dashboard schemes={[]} userDetails={mockUserDetails} />);
      expect(
        screen.queryByRole('link', { name: 'View all schemes' })
      ).toBeFalsy();
    });
  });
});
