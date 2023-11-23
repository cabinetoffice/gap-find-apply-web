import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import { GrantApplicant } from '../../types/models/GrantApplicant';
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
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'false';
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
        organisationType: 'Registered Charity',
        descriptionList,
        hasApplications: true,
        bannerProps: null,
        oneLoginEnabled: false,
      },
    });
    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
  });

  it('should return a DescriptionListProps object with detail null', async () => {
    const oneLoginEnabledBackup = process.env.ONE_LOGIN_ENABLED;
    process.env.ONE_LOGIN_ENABLED = 'false';
    const getGrantApplicantSpy = jest
      .spyOn(GrantApplicantService.prototype, 'getGrantApplicant')
      .mockResolvedValue(MOCK_GRANT_APPLICANT_NO_LEGAL_NAME);

    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    const result = await getServerSideProps(getContext(getDefaultContext));

    expect(getGrantApplicantSpy).toBeCalledTimes(1);
    expect(getGrantApplicantSpy).toBeCalledWith('testJwt');

    expectObjectEquals(result, {
      props: {
        organisationType: 'Registered Charity',
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
        bannerProps: null,
        oneLoginEnabled: false,
      },
    });
    process.env.ONE_LOGIN_ENABLED = oneLoginEnabledBackup;
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

  it('should redirect to find redirect page', async () => {
    const mandatoryQuestionsEnabledBackup =
      process.env.MANDATORY_QUESTIONS_ENABLED;
    process.env.MANDATORY_QUESTIONS_ENABLED = 'true';
    const result = await getServerSideProps(
      getContext(getDefaultContext, {
        req: {
          cookies: {
            [process.env.FIND_REDIRECT_COOKIE]: '?slug=slug-123',
          },
        },
        res: {
          setHeader: mockSetHeader,
        },
      })
    );

    expect(mockSetHeader).toBeCalledWith(
      'Set-Cookie',
      `${process.env.FIND_REDIRECT_COOKIE}=deleted; Path=/; Max-Age=0`
    );
    expectObjectEquals(result, {
      redirect: {
        destination: '/api/redirect-from-find?slug=slug-123',
        statusCode: 307,
      },
    });
    process.env.MANDATORY_QUESTIONS_ENABLED = mandatoryQuestionsEnabledBackup;
  });

  it('should not redirect to find redirect page', async () => {
    const mandatoryQuestionsEnabledBackup =
      process.env.MANDATORY_QUESTIONS_ENABLED;
    process.env.MANDATORY_QUESTIONS_ENABLED = 'false';
    const result = await getServerSideProps(
      getContext(getDefaultContext, {
        req: {
          cookies: {
            [process.env.FIND_REDIRECT_COOKIE]: '?slug=slug-123',
          },
        },
        res: {
          setHeader: mockSetHeader,
        },
      })
    );

    expect(mockSetHeader).not.toBeCalledWith(
      'Set-Cookie',
      `${process.env.FIND_REDIRECT_COOKIE}=deleted; Path=/; Max-Age=0`
    );
    process.env.MANDATORY_QUESTIONS_ENABLED = mandatoryQuestionsEnabledBackup;
  });
});
