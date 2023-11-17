import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { GrantApplicant } from '../../models/GrantApplicant';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { createMockRouter } from '../../testUtils/createMockRouter';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import ManageOrganisationDetails, { getServerSideProps } from './index.page';
jest.mock('../../utils/jwt');
jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
    },
  };
});

const context = {
  params: {
    applicationId: '1',
  },
} as unknown as GetServerSidePropsContext;
const APPLICANT_ID = '75ab5fbd-0682-4d3d-a467-01c7a447f07c';
const MOCK_GRANT_APPLICANT: GrantApplicant = {
  id: APPLICANT_ID,
  email: 'test@email.com',
  organisation: {
    id: 'liksjnke',
    legalName: 'Chris charity',
    addressLine1: 'First Line',
    addressLine2: 'Second Line',
    town: 'Edinburgh',
    county: 'Lothian',
    postcode: 'EH22 2TH',
    type: 'Limited',
    companiesHouseNumber: '98239829382',
    charityCommissionNumber: '09090909',
  },
};

type GetTestDataType = {
  populatedRows: boolean;
};

const getGeneralOrganisationRows = ({ populatedRows }: GetTestDataType) => [
  {
    id: 'organisationName',
    label: 'Name',
    value: populatedRows ? 'Chris charity' : '',
    url: '/organisation/name',
    status: populatedRows ? 'Change' : 'Add',
  },
  {
    id: 'organisationAddress',
    label: 'Address',
    value: populatedRows
      ? ['First Line', 'Second Line', 'Edinburgh', 'Lothian', 'EH22 2TH']
      : null,
    url: '/organisation/address',
    status: populatedRows ? 'Change' : 'Add',
  },

  {
    id: 'organisationCompaniesHouseNumber',
    label: 'Companies house number',
    value: populatedRows ? '98239829382' : '',
    url: '/organisation/companies-house-number',
    status: populatedRows ? 'Change' : 'Add',
  },
  {
    id: 'organisationCharity',
    label: 'Charity commission number',
    value: populatedRows ? '09090909' : '',
    url: '/organisation/charity-commission-number',
    status: populatedRows ? 'Change' : 'Add',
  },
];

const getTypeOfOrganisationRow = ({ populatedRows }: GetTestDataType) => ({
  id: 'organisationType',
  label: 'Type of organisation',
  value: populatedRows ? 'Limited' : '',
  url: '/organisation/type',
  status: populatedRows ? 'Change' : 'Add',
});

describe('getServerSideProps', () => {
  afterEach(jest.resetAllMocks);
  it('should display change button and values if details are present', async () => {
    const getGrantApplicantSpy = jest
      .spyOn(GrantApplicantService.prototype, 'getGrantApplicant')
      .mockResolvedValue(MOCK_GRANT_APPLICANT);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        generalOrganisationRows: getGeneralOrganisationRows({
          populatedRows: true,
        }),
        typeOfOrganisationRow: getTypeOfOrganisationRow({
          populatedRows: true,
        }),
        isIndividual: false,
      },
    });
    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');
  });

  it('should display add button and a "-" if details are not present', async () => {
    const getGrantApplicantSpy = jest
      .spyOn(GrantApplicantService.prototype, 'getGrantApplicant')
      .mockResolvedValue({
        id: APPLICANT_ID,
        email: 'test@email.com',
        organisation: {
          id: 'liksjnke',
          legalName: '',
          addressLine1: '',
          addressLine2: '',
          town: '',
          county: '',
          postcode: '',
          type: '',
          companiesHouseNumber: '',
          charityCommissionNumber: '',
        },
      });
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        generalOrganisationRows: getGeneralOrganisationRows({
          populatedRows: false,
        }),
        typeOfOrganisationRow: getTypeOfOrganisationRow({
          populatedRows: false,
        }),
        isIndividual: false,
      },
    });
    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');
  });
});

describe('Manage organisation page should render properly', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: routes.organisation.index,
        })}
      >
        <ManageOrganisationDetails
          isIndividual={false}
          typeOfOrganisationRow={getTypeOfOrganisationRow({
            populatedRows: true,
          })}
          generalOrganisationRows={getGeneralOrganisationRows({
            populatedRows: true,
          })}
        />
      </RouterContext.Provider>
    );
  });
  it('should render the correct heading and paragraph', () => {
    expect(screen.getAllByText('Your organisation details')).toBeDefined();
    expect(
      screen.getByText(
        'Funding organisations run checks to prevent fraud. The information below will be used as part of these checks.'
      )
    ).toBeDefined();
  });

  it('should render the table keys', () => {
    expect(screen.getAllByText('Name')).toBeDefined();
    expect(screen.getAllByText('Address')).toBeDefined();
    expect(screen.getAllByText('Type of organisation')).toBeDefined();
    expect(screen.getAllByText('Companies house number')).toBeDefined();
    expect(screen.getAllByText('Charity commission number')).toBeDefined();
  });

  it('should render the correct key values', () => {
    expect(screen.getByText('Chris charity')).toBeDefined();
    expect(screen.queryByText('-')).toBeNull();
    expect(screen.getByText('98239829382')).toBeDefined();
    expect(screen.getByText('09090909')).toBeDefined();
    expect(screen.getByText('Limited')).toBeDefined();
    expect(screen.getByText('First Line,')).toBeDefined();
    expect(screen.getByText('Second Line,')).toBeDefined();
    expect(screen.getByText('Edinburgh,')).toBeDefined();
    expect(screen.getByText('Lothian,')).toBeDefined();
    expect(screen.getByText('EH22 2TH')).toBeDefined();
  });

  // Doesn't mock the organisation call
  it('should render the option to change the details', () => {
    expect(
      screen.getByRole('link', {
        name: 'Change /organisation/name',
      })
    ).toHaveProperty('href', 'http://localhost' + routes.organisation.name);

    expect(
      screen.getByRole('link', {
        name: 'Change /organisation/address',
      })
    ).toHaveProperty('href', 'http://localhost' + routes.organisation.address);

    expect(
      screen.getByRole('link', {
        name: 'Change /organisation/type',
      })
    ).toHaveProperty('href', 'http://localhost' + routes.organisation.type);

    expect(
      screen.getByRole('link', {
        name: 'Change /organisation/charity-commission-number',
      })
    ).toHaveProperty(
      'href',
      'http://localhost' + routes.organisation.charityComissionNumber
    );

    expect(
      screen.getByRole('link', {
        name: 'Change /organisation/companies-house-number',
      })
    ).toHaveProperty(
      'href',
      'http://localhost' + routes.organisation.companiesHouseNumber
    );
  });
});

describe('Manage page should render without an address', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: routes.organisation.index,
        })}
      >
        <ManageOrganisationDetails
          isIndividual={false}
          typeOfOrganisationRow={getTypeOfOrganisationRow({
            populatedRows: false,
          })}
          generalOrganisationRows={getGeneralOrganisationRows({
            populatedRows: false,
          })}
        />
      </RouterContext.Provider>
    );
  });

  it('should render the correct key values', () => {
    expect(document.getElementById('organisationName').innerHTML).toBe('-');
    expect(document.getElementById('organisationAddress').innerHTML).toBe('-');
    expect(document.getElementById('organisationType').innerHTML).toBe('-');
    expect(document.getElementById('organisationCharity').innerHTML).toBe('-');
    expect(
      document.getElementById('organisationCompaniesHouseNumber').innerHTML
    ).toBe('-');
  });

  it('should render the number option to add details', () => {
    expect(
      screen.getByRole('link', {
        name: 'Add /organisation/name',
      })
    ).toHaveProperty('href', 'http://localhost' + routes.organisation.name);

    expect(
      screen.getByRole('link', {
        name: 'Add /organisation/address',
      })
    ).toHaveProperty('href', 'http://localhost' + routes.organisation.address);

    expect(
      screen.getByRole('link', {
        name: 'Add /organisation/type',
      })
    ).toHaveProperty('href', 'http://localhost' + routes.organisation.type);

    expect(
      screen.getByRole('link', {
        name: 'Add /organisation/charity-commission-number',
      })
    ).toHaveProperty(
      'href',
      'http://localhost' + routes.organisation.charityComissionNumber
    );

    expect(
      screen.getByRole('link', {
        name: 'Add /organisation/companies-house-number',
      })
    ).toHaveProperty(
      'href',
      'http://localhost' + routes.organisation.companiesHouseNumber
    );
  });

  it('should back to account button', () => {
    expect(
      screen.getByRole('button', { name: 'Back to my account' })
    ).toHaveAttribute('href', '/dashboard');
  });
});
