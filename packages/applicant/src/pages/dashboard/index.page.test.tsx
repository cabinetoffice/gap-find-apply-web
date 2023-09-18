import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import { GrantApplicant } from '../../models/GrantApplicant';
import { getApplicationsListById } from '../../services/ApplicationService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';
import { getServerSideProps } from './index.page';
import { Optional, expectObjectEquals, getContext } from 'gap-web-ui';

jest.mock('../../services/ApplicationService');
jest.mock('../../utils/jwt');

const APPLICANT_ID = '75ab5fbd-0682-4d3d-a467-01c7a447f07c';
const MOCK_GRANT_APPLICANT: GrantApplicant = {
  id: APPLICANT_ID,
  email: 'test@email.com',
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
  email: 'test@email.com',
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
    { term: 'Email', detail: MOCK_GRANT_APPLICANT.email },
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

describe('getServerSideProps', () => {
  const env = process.env;

  function getDefaultContext(): Optional<GetServerSidePropsContext> {
    return {
      params: {
        applicationId: '1',
      },
    };
  }

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

    const result = await getServerSideProps(getContext(getDefaultContext));

    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');

    expectObjectEquals(result, {
      props: {
        descriptionList,
        hasApplications: true,
        showMigrationErrorBanner: false,
        showMigrationSuccessBanner: false,
        oneLoginEnabled: false,
      },
    });
  });

  it('should return a DescriptionListProps object with detail null', async () => {
    const getGrantApplicantSpy = jest
      .spyOn(GrantApplicantService.prototype, 'getGrantApplicant')
      .mockResolvedValue(MOCK_GRANT_APPLICANT_NO_LEGAL_NAME);

    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    const result = await getServerSideProps(getContext(getDefaultContext));

    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');

    expectObjectEquals(result, {
      props: {
        descriptionList: {
          data: [
            { term: 'Email', detail: MOCK_GRANT_APPLICANT_NO_LEGAL_NAME.email },
            {
              term: 'Organisation',
              detail: null,
            },
          ],
          needAddOrChangeButtons: false,
          needBorder: false,
        },
        hasApplications: true,
        showMigrationErrorBanner: false,
        showMigrationSuccessBanner: false,
        oneLoginEnabled: false,
      },
    });
  });

  const mockSetHeader = jest.fn();

  it('should redirect to applications page', async () => {
    const result = await getServerSideProps(
      getContext(getDefaultContext, {
        req: {
          cookies: {
            testRedirectCookie: '1',
          },
        },
        res: {
          setHeader: mockSetHeader,
        },
      })
    );

    expect(mockSetHeader).toBeCalledWith(
      'Set-Cookie',
      'testRedirectCookie=deleted; Path=/; Max-Age=0'
    );
    expectObjectEquals(result, {
      redirect: {
        destination: '/applications/1',
        statusCode: 307,
      },
    });
  });

  it('should redirect to applications page with migration status set', async () => {
    const result = await getServerSideProps(
      getContext(getDefaultContext, {
        query: {
          migrationStatus: 'success',
        },
        req: {
          cookies: {
            testRedirectCookie: '1',
          },
        },
        res: {
          setHeader: mockSetHeader,
        },
      })
    );

    expect(mockSetHeader).toBeCalledWith(
      'Set-Cookie',
      'testRedirectCookie=deleted; Path=/; Max-Age=0'
    );
    expectObjectEquals(result, {
      redirect: {
        destination: '/applications/1?migrationStatus=success',
        statusCode: 307,
      },
    });
  });
});
