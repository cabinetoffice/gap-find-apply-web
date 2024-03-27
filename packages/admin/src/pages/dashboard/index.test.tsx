import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Optional, expectObjectEquals, getContext, getProps } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import { getLoggedInUsersDetails } from '../../services/UserService';
import InferProps from '../../types/InferProps';
import UserDetails from '../../types/UserDetails';
import Dashboard, { getServerSideProps } from './index.page';
import { getOwnedAndEditableSchemes } from '../../services/SchemeEditorService';

jest.mock('../../services/SchemeService');
jest.mock('../../services/UserService');
jest.mock('../../services/SchemeEditorService');

const mockSchemeList = {
  ownedSchemes: [
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
  ],
  editableSchemes: [
    {
      name: 'Scheme name 3',
      schemeId: '789',
      ggisReference: 'ggisReference',
      funderId: '26675',
      createdDate: '2011-12-10T14:48:00',
      lastUpdatedDate: '2011-12-10T15:50:00',
      lastUpdatedBy: 'test@email.com',
    },
    {
      name: 'Scheme name 4',
      schemeId: '987',
      ggisReference: 'ggisReference',
      funderId: '26675',
      createdDate: '2011-10-10T16:48:00',
      lastUpdatedDate: '2011-12-10T14:48:00',
      lastUpdatedBy: 'test2@email.com',
    },
  ],
};

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
    const mockedGeEditableSchemes = jest.mocked(getOwnedAndEditableSchemes);
    const mockedGetLoggedInUsersDetails = jest.mocked(getLoggedInUsersDetails);

    function getDefaultContext(): Optional<GetServerSidePropsContext> {
      return {};
    }

    beforeEach(() => {
      mockedGeEditableSchemes.mockResolvedValue(mockSchemeList);
      mockedGetLoggedInUsersDetails.mockResolvedValue(mockUserDetails);
      process.env.SESSION_COOKIE_NAME = 'gap-test';
      process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED = 'false';
    });

    it('Should return a list of schemes', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        props: {
          ownedSchemes: mockSchemeList.ownedSchemes,
          editableSchemes: mockSchemeList.editableSchemes,
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
        ownedSchemes: mockSchemeList.ownedSchemes,
        editableSchemes: mockSchemeList.editableSchemes,
        bannerProps: null,
        userDetails: mockUserDetails,
        isTechSupportUser: false,
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

      screen.findByRole('definition', { name: 'test@email.com' });
    });

    it('Should render the organisation name', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.findByRole('definition', { name: 'Testing Org' });
    });

    it('Should render the "Grants you own" table if there are grants', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      expect(screen.getByRole('table', { name: 'Grants you own' }));
    });

    it('Should NOT render the "Grants you own" table if there are no grants', () => {
      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            ownedSchemes: [],
          })}
        />
      );

      expect(
        screen.queryByRole('table', { name: 'Grants you own' })
      ).not.toBeInTheDocument();
    });

    it('Should render the "Grants you cam edit" table if there are grants', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      expect(screen.getByRole('table', { name: 'Grants you can edit' }));
    });

    it('Should NOT render the "Grants you cam edit" table if there are no grants', () => {
      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            editableSchemes: [],
          })}
        />
      );

      expect(
        screen.queryByRole('table', { name: 'Grants you can edit' })
      ).not.toBeInTheDocument();
    });

    it('Should render the "grants linked to your account" paragraph if there are schemes', () => {
      const text = 'All of the grants linked to your account are listed below.';

      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByText(text);
    });

    it('Should render the no editing permissions paragraph if there are no schemes', () => {
      const text = 'You do not own or have editing permissions for any grants.';

      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            ownedSchemes: [],
            editableSchemes: [],
          })}
        />
      );

      screen.getByText(text);
    });

    it('Should render the "Add a grant" button when there are schemes', () => {
      render(<Dashboard {...getProps(getDefaultProps)} />);

      screen.getByText('Add a grant');
    });

    it('Should render the "Add a grant" button when there are no schemes', () => {
      render(
        <Dashboard
          {...getProps(getDefaultProps, {
            ownedSchemes: [],
            editableSchemes: [],
          })}
        />
      );

      screen.getByText('Add a grant');
    });
  });
});
