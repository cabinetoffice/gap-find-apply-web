import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import { GrantApplicant } from '../../models/GrantApplicant';
import { getApplicationsListById } from '../../services/ApplicationService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { createMockRouter } from '../../testUtils/createMockRouter';
import { getJwtFromCookies } from '../../utils/jwt';
import ApplicantDashboardPage, {
  ApplicantDashBoardPageProps,
  getServerSideProps,
} from './index.page';

jest.mock('../../services/ApplicationService');
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
  req: {
    cookies: {},
  },
} as unknown as GetServerSidePropsContext;
const APPLICANT_ID = '75ab5fbd-0682-4d3d-a467-01c7a447f07c';
const MOCK_GRANT_APPLICANT: GrantApplicant = {
  id: APPLICANT_ID,
  fullName: 'Jack Dale',
  organisation: {
    id: 'a048d000003Sk39AAC',
    legalName: 'Boat Service',
    type: 'Registered Charity',
    addressLine1: '1 Apex Lane',
    addressLine2: 'Apexis',
    town: 'Apex Town',
    county: 'Apex County',
    postcode: 'A10 2PE',
    charityCommissionNumber: '1122334455',
    companiesHouseNumber: '66778899',
  },
};

const MOCK_GRANT_APPLICANT_NO_LEGAL_NAME: GrantApplicant = {
  id: APPLICANT_ID,
  fullName: 'Jack Dale',
  organisation: {
    id: 'a048d000003Sk39AAC',
    legalName: null,
    type: 'Registered Charity',
    addressLine1: '1 Apex Lane',
    addressLine2: 'Apexis',
    town: 'Apex Town',
    county: 'Apex County',
    postcode: 'A10 2PE',
    charityCommissionNumber: '1122334455',
    companiesHouseNumber: '66778899',
  },
};
const descriptionList: DescriptionListProps = {
  data: [
    { term: 'Name', detail: MOCK_GRANT_APPLICANT.fullName },
    {
      term: 'Organisation',
      detail: MOCK_GRANT_APPLICANT.organisation.legalName,
    },
  ],
  needAddOrChangeButtons: false,
  needBorder: false,
};

const MockApplicationsList = [
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'subId1',
    applicationName: 'Application 1',
    submissionStatus: 'IN_PROGRESS',
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
];

const applicantDashboardProps: ApplicantDashBoardPageProps = {
  descriptionList: descriptionList,
  hasApplications: true,
};
//TODO once we fetch the Applicant Name and the Organisation Name this test will completely change
describe('getServerSideProps', () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    process.env.APPLYING_FOR_REDIRECT_COOKIE = 'testRedirectCookie';
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a DescriptionListProps object', async () => {
    const getGrantApplicantSpy = jest
      .spyOn(GrantApplicantService.prototype, 'getGrantApplicant')
      .mockResolvedValue(MOCK_GRANT_APPLICANT);

    (getApplicationsListById as jest.Mock).mockReturnValue(
      MockApplicationsList
    );
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const result = await getServerSideProps(context);

    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');

    expect(result).toStrictEqual({
      props: {
        descriptionList,
        hasApplications: true,
      },
    });
  });

  it('should return a DescriptionListProps object with detail null', async () => {
    const getGrantApplicantSpy = jest
      .spyOn(GrantApplicantService.prototype, 'getGrantApplicant')
      .mockResolvedValue(MOCK_GRANT_APPLICANT_NO_LEGAL_NAME);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    const result = await getServerSideProps(context);

    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');

    expect(result).toStrictEqual({
      props: {
        descriptionList: {
          data: [
            { term: 'Name', detail: MOCK_GRANT_APPLICANT.fullName },
            {
              term: 'Organisation',
              detail: null,
            },
          ],
          needAddOrChangeButtons: false,
          needBorder: false,
        },
        hasApplications: true,
      },
    });
  });

  const mockSetHeader = jest.fn();
  const contextWithRedirectCookie = {
    params: {
      applicationId: '1',
    },
    req: {
      cookies: {
        testRedirectCookie: 1,
      },
    },
    res: {
      setHeader: mockSetHeader,
    },
  } as unknown as GetServerSidePropsContext;

  it('should redirect to applications page', async () => {
    const result = await getServerSideProps(contextWithRedirectCookie);

    expect(mockSetHeader).toBeCalledWith(
      'Set-Cookie',
      'testRedirectCookie=deleted; Path=/; Max-Age=0'
    );
    expect(result).toStrictEqual({
      redirect: {
        destination: '/applications/1',
        statusCode: 307,
      },
    });
  });
});

describe('ApplicantDashboardPage component', () => {
  beforeEach(() => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ pathname: '/dashboard' })}
      >
        <ApplicantDashboardPage {...applicantDashboardProps} />
      </RouterContext.Provider>
    );
  });
  describe('should render first section', () => {
    it('should render heading', () => {
      screen.getByRole('heading', {
        name: /your account/i,
      });
    });
    it('should render table personal name element', () => {
      screen.getByRole('term', {
        name: /name/i,
      });
      screen.getByText(/Jack Dale/i);
    });

    it('should render table organisation name element', () => {
      screen.getByRole('term', {
        name: /organisation/i,
      });

      screen.getByText(/Boat Service/i);
    });
  });
});
