import { merge } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  GrantApplicantOrganisationProfileService,
  UpdateOrganisationDetailsDto,
} from '../../services/GrantApplicantOrganisationProfileService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../services/GrantMandatoryQuestionService';
import { GrantSchemeService } from '../../services/GrantSchemeService';
import {
  CreateSubmissionResponse,
  createSubmission,
} from '../../services/SubmissionService';
import { Overrides } from '../../testUtils/unitTestHelpers';
import { GrantAdvert } from '../../types/models/GrantAdvert';
import { GrantApplicant } from '../../types/models/GrantApplicant';
import { GrantApplication } from '../../types/models/GrantApplication';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import handler from './create-submission.page';

jest.mock('../../services/SubmissionService');
jest.mock('../../services/GrantMandatoryQuestionService.ts');
jest.mock('../../services/GrantApplicantService');
jest.mock('../../services/GrantApplicantOrganisationProfileService');
jest.mock('../../utils/jwt');
jest.mock('../../services/GrantSchemeService');

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
const ORGANISATION_ID = 'a048d000003Sk39AAC';
const MOCK_ORGANISATION_DATA: UpdateOrganisationDetailsDto = {
  id: ORGANISATION_ID,
  legalName: 'Boat Service',
  type: 'Registered Charity',
  addressLine1: '1 Apex Lane',
  addressLine2: 'Apexis',
  town: 'Apex Town',
  county: 'Apex County',
  postcode: 'A10 2PE',
  charityCommissionNumber: '1122334455',
  companiesHouseNumber: '66778899',
};

const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides?: Overrides<jest.Mock>) =>
  merge(
    {
      query: {
        schemeId: 'schemeId',
        mandatoryQuestionId: 'mandatoryQuestionId',
      },
    },
    overrides || {}
  ) as unknown as NextApiRequest;

const res = (overrides?: Overrides<jest.Mock>) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides || {}
  ) as unknown as NextApiResponse;

const backup_host = process.env.HOST;

describe('API Handler Tests', () => {
  beforeEach(() => {
    process.env.HOST = 'http://localhost';
    jest.resetAllMocks();
  });

  afterEach(() => {
    process.env.HOST = backup_host;
  });

  const grantMandatoryQuestion: GrantMandatoryQuestionDto = {
    id: 'mandatoryQuestionId',
    schemeId: 2,
    name: 'name',
    city: 'city',
    postcode: 'postcode',
    orgType: 'orgType',
    companiesHouseNumber: 'companiesHouseNumber',
    charityCommissionNumber: 'charityCommissionNumber',
  };

  const advertDTO: GrantAdvert = {
    id: null,
    version: null,
    grantApplicationId: null,
    isInternal: null,
    grantSchemeId: null,
    externalSubmissionUrl: null,
    isAdvertInDatabase: false,
  };

  const createSubmissionResponse: CreateSubmissionResponse = {
    submissionCreated: 'submissionCreated',
    submissionId: 'submissionId',
  };

  it('should redirect to external application page when advert is external', async () => {
    const getAdvertBySchemeIdResponse = {
      ...advertDTO,
      isInternal: false,
      externalSubmissionUrl: 'externalSubmissionUrl',
    };
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    GrantApplicantService.getInstance.mockReturnValue({
      getGrantApplicant: jest.fn().mockResolvedValue(MOCK_GRANT_APPLICANT),
    });
    GrantMandatoryQuestionService.getInstance.mockReturnValue({
      getMandatoryQuestionById: jest.fn().mockResolvedValue({
        ...grantMandatoryQuestion,
      }),
      updateMandatoryQuestion: jest.fn().mockResolvedValue({
        ...grantMandatoryQuestion,
      }),
    });
    GrantApplicantOrganisationProfileService.getInstance.mockReturnValue({
      updateOrganisation: jest.fn().mockResolvedValue(MOCK_ORGANISATION_DATA),
    });
    GrantSchemeService.getInstance.mockReturnValue({
      getGrantSchemeById: jest.fn().mockResolvedValue({
        grantAdverts: [getAdvertBySchemeIdResponse],
        grantApplication: { id: null },
      }),
    });

    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      `http://localhost${routes.mandatoryQuestions.externalApplicationPage(
        'mandatoryQuestionId'
      )}?url=externalSubmissionUrl`
    );
  });

  it('should redirect to internal application page when advert is internal', async () => {
    const getAdvertBySchemeIdResponse = {
      ...advertDTO,
      isInternal: true,
      grantApplicationId: 'grantApplicationId',
    };

    const getGrantApplicationResponse: GrantApplication = {
      id: '1',
      version: 2,
      created: '',
      lastUpdated: '',
      lastUpdatedBy: 1,
      applicationName: 'application name',
      applicationStatus: 'PUBLISHED',
      definition: null,
    };
    GrantSchemeService.getInstance.mockReturnValue({
      getGrantSchemeById: jest.fn().mockResolvedValue({
        grantAdverts: [getAdvertBySchemeIdResponse],
        grantApplication: getGrantApplicationResponse,
      }),
    });
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (createSubmission as jest.Mock).mockResolvedValue(createSubmissionResponse);

    GrantApplicantService.getInstance.mockReturnValue({
      getGrantApplicant: jest.fn().mockResolvedValue(MOCK_GRANT_APPLICANT),
    });
    GrantMandatoryQuestionService.getInstance.mockReturnValue({
      getMandatoryQuestionById: jest.fn().mockResolvedValue({
        ...grantMandatoryQuestion,
      }),
      updateMandatoryQuestion: jest.fn().mockResolvedValue({
        ...grantMandatoryQuestion,
        submissionId: 'submissionId',
      }),
    });
    GrantApplicantOrganisationProfileService.getInstance.mockReturnValue({
      updateOrganisation: jest.fn().mockResolvedValue(MOCK_ORGANISATION_DATA),
    });

    await handler(req(), res());

    expect(mockedRedirect).toHaveBeenCalledWith(
      `http://localhost${routes.submissions.sections('submissionId')}`
    );
  });

  it('should redirect to error page when there is an error in the backend', async () => {
    await handler(req(), res());

    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: routes.mandatoryQuestions.summaryPage('mandatoryQuestionId'),
        linkText: 'Go back to the summary page and try again',
        linkInformation: '',
      },
    };
    expect(mockedRedirect).toHaveBeenCalledWith(
      `/service-error?serviceErrorProps=${JSON.stringify(serviceErrorProps)}`
    );
  });
});
