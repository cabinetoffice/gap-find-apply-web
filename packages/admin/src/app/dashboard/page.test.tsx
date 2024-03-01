import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Scheme from '../../types/Scheme';
import Dashboard, { DashboardPageProps } from './page.page';
import UserDetails from '../../types/UserDetails';
import { getProps } from 'gap-web-ui';
import { getUserSchemes } from '../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../services/UserService';

jest.mock('../../services/SchemeService');
jest.mock('../../services/UserService');

const mockedSchemeService = jest.mocked(getUserSchemes);
const mockedGetLoggedInUsersDetails = jest.mocked(getLoggedInUsersDetails);

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
  roles: '[FIND, APPLICANT, ADMIN]',
  organisationName: 'Testing Org',
  created: '2003-01-13T00:00:00',
};

describe('Dashboard', () => {
  function getDefaultProps(): DashboardPageProps {
    return {
      searchParams: {
        applyMigrationStatus: undefined,
        findMigrationStatus: undefined,
      },
    };
  }

  beforeEach(() => {
    mockedGetLoggedInUsersDetails.mockResolvedValue(mockUserDetails);
    mockedSchemeService.mockResolvedValue(mockSchemeList);
  });

  it('Should render a page title', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByRole('heading', { name: 'Manage a grant' });
  });

  it('Should render the error banner', async () => {
    render(
      await Dashboard(
        getProps(getDefaultProps, {
          searchParams: { applyMigrationStatus: 'FAILED' },
        })
      )
    );

    screen.getByRole('heading', { level: 2, name: 'Important' });
    screen.getByText('Something went wrong while transferring your data.');
    expect(
      screen.getByRole('link', {
        name: 'findagrant@cabinetoffice.gov.uk',
      })
    ).toHaveAttribute('href', 'mailto:findagrant@cabinetoffice.gov.uk');
  });

  it('Should not render the error banner', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    expect(
      screen.queryByRole('heading', { level: 2, name: 'Important' })
    ).toBeFalsy();
  });

  it(`renders success banner when migrationSucceeded is 'true'`, async () => {
    render(
      await Dashboard(
        getProps(getDefaultProps, {
          searchParams: { applyMigrationStatus: 'SUCCEEDED' },
        })
      )
    );

    screen.getByRole('heading', { level: 2, name: 'Success' });
    screen.getByText(
      'Your data has been successfully added to your One Login account.'
    );
  });

  it('does not render success banner when migrationSucceeded not passed', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    expect(
      screen.queryByRole('heading', { level: 2, name: 'Success' })
    ).toBeFalsy();
  });

  it('Should render the user email', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByText('test@email.com');
  });

  it('Should render the organisation name', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByText('Testing Org');
  });

  it('Should render the "manage your grant scheme table" headings when there are schemes', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByRole('columnheader', { name: 'Name' });
    screen.getByRole('columnheader', { name: 'Date created' });
  });

  it('Should render the "manage your grant scheme table" scheme names when there are schemes', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByRole('cell', { name: 'Scheme name 1' });
    screen.getByRole('cell', { name: 'Scheme name 2' });
  });

  it('Should render the "manage your grant scheme table" scheme created at dates when there are schemes', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByRole('cell', { name: '10 December 2011' });
    screen.getByRole('cell', { name: '10 October 2011' });
  });

  it('Should render the "manage your grant scheme table" scheme view links when there are schemes', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    expect(
      screen.getByRole('link', { name: 'View scheme Scheme name 1' })
    ).toHaveAttribute('href', '/apply/admin/scheme/123');
    expect(
      screen.getByRole('link', { name: 'View scheme Scheme name 2' })
    ).toHaveAttribute('href', '/apply/admin/scheme/456');
  });

  it('Should render a View all schemes link to the schemes page when there are schemes', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    const viewAllSchemesElement = screen.getByRole('link', {
      name: 'View all grants',
    });
    expect(viewAllSchemesElement).toHaveAttribute('href', '/scheme-list');
  });

  it('Should NOT render the "create new grant scheme" section when there are schemes', async () => {
    render(await Dashboard(getProps(getDefaultProps)));

    expect(screen.queryByTestId('create-new-grant-scheme-section')).toBeFalsy();
  });

  it('Should NOT render the "manage your grant scheme table" when there are no schemes', async () => {
    mockedSchemeService.mockResolvedValue([]);

    render(await Dashboard(getProps(getDefaultProps)));

    const manageGrantSchemeTable = screen.queryByTestId(
      'manage-grant-scheme-table'
    );
    expect(manageGrantSchemeTable).toBeFalsy();
  });

  it('Should render the "create new grant scheme" section when there are no schemes', async () => {
    mockedSchemeService.mockResolvedValue([]);

    render(await Dashboard(getProps(getDefaultProps)));

    screen.getByRole('heading', { name: 'Add grant details' });
    screen.getByText('Start by adding the details of your grant.');
    screen.getByRole('link', { name: 'Add a grant' });
  });

  it('Should NOT render the "create new grant scheme" side bar when there are no schemes', async () => {
    mockedSchemeService.mockResolvedValue([]);

    render(await Dashboard(getProps(getDefaultProps)));

    expect(
      screen.queryByText('Create new grant schemes to advertise your grants.')
    ).toBeFalsy();
    expect(screen.queryByTestId('create-new-grant-scheme-sidebar')).toBeFalsy();
  });

  it('Should NOT render a View all schemes link to the schemes page when there are no schemes', async () => {
    mockedSchemeService.mockResolvedValue([]);

    render(await Dashboard(getProps(getDefaultProps)));

    expect(
      screen.queryByRole('link', { name: 'View all schemes' })
    ).toBeFalsy();
  });
});
