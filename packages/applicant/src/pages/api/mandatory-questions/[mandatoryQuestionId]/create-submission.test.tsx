import { merge } from 'lodash';
import {
  AdvertDto,
  getAdvertBySchemeId,
} from '../../../../services/GrantAdvertService';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../../services/GrantMandatoryQuestionService';
import {
  CreateSubmissionResponse,
  createSubmission,
} from '../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../utils/jwt';
import { routes } from '../../../../utils/routes';
import handler from './create-submission.page';

jest.mock('../../../../services/GrantAdvertService');
jest.mock('../../../../services/SubmissionService');
jest.mock('../../../../services/GrantMandatoryQuestionService.ts');
jest.mock('../../../../utils/jwt');

const mockedRedirect = jest.fn();
const mockedSetHeader = jest.fn();
const mockedSend = jest.fn();

const req = (overrides: any = {}) =>
  merge({
    query: {
      schemeId: 'schemeId',
      mandatoryQuestionId: 'mandatoryQuestionId',
    },
  });

const res = (overrides: any = {}) =>
  merge(
    {
      redirect: mockedRedirect,
      setHeader: mockedSetHeader,
      send: mockedSend,
    },
    overrides
  );
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

  const advertDTO: AdvertDto = {
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
    (getAdvertBySchemeId as jest.Mock).mockResolvedValue(
      getAdvertBySchemeIdResponse
    );
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

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
    (getAdvertBySchemeId as jest.Mock).mockResolvedValue(
      getAdvertBySchemeIdResponse
    );
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    (createSubmission as jest.Mock).mockResolvedValue(createSubmissionResponse);

    GrantMandatoryQuestionService.getInstance.mockReturnValue({
      updateMandatoryQuestion: jest.fn().mockResolvedValue({
        ...grantMandatoryQuestion,
        submissionId: 'submissionId',
      }),
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
        linkText: 'Go back to the summary page adn try again',
        linkInformation: '',
      },
    };
    expect(mockedRedirect).toHaveBeenCalledWith(
      `/service-error?serviceErrorProps=${JSON.stringify(serviceErrorProps)}`
    );
  });
});
