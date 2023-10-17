import { GetServerSidePropsContext } from 'next';
import { parseBody } from 'next/dist/server/api-utils/node';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';
import {
  Optional,
  expectObjectEquals,
  getContext,
  mockServiceMethod,
} from '../../../testUtils/unitTestHelpers';
import { generateRedirectUrlForMandatoryQuestionNextPage } from '../../../utils/mandatoryQuestionUtils';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../utils/mandatoryQuestionUtils');

const spiedGrantMandatoryQuestionServiceGetMandatoryQuestion = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'getMandatoryQuestionById'
);

const spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'updateMandatoryQuestion'
);
const userTokenNameBackup = process.env.USER_TOKEN_NAME;
describe('getServerSideProps', () => {
  const getDefaultGrantMandatoryQuestion = (): GrantMandatoryQuestionDto => ({
    schemeId: 1,
    submissionId: null,
    name: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    county: null,
    postcode: null,
    charityCommissionNumber: null,
    companiesHouseNumber: null,
    orgType: null,
    fundingAmount: null,
    fundingLocation: null,
    isPageAlreadyAnswered: false,
    nextNotAnsweredPage: '/nextpage',
  });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.USER_TOKEN_NAME = 'gap-test';
  });
  afterEach(() => {
    process.env.USER_TOKEN_NAME = userTokenNameBackup;
  });
  describe('when handling a GET request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: { mandatoryQuestionId: 'mandatoryQuestionId' },
      query: {},
    });

    it('should return the right props', async () => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion
      );
      (
        generateRedirectUrlForMandatoryQuestionNextPage as jest.Mock
      ).mockReturnValue('/nextpage');

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        props: {
          csrfToken: 'testCSRFToken',
          fieldErrors: [],
          formAction: '/testResolvedURL',
          defaultFields: getDefaultGrantMandatoryQuestion(),
          mandatoryQuestion: getDefaultGrantMandatoryQuestion(),
          mandatoryQuestionId: 'mandatoryQuestionId',
        },
      });
    });

    it('Should call getMandatoryQuestionById', async () => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion
      );

      await getServerSideProps(getContext(getDefaultContext));

      expect(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion
      ).toHaveBeenNthCalledWith(
        1,
        'mandatoryQuestionId',
        '/testResolvedURL',
        'testSessionId'
      );
    });

    it('should redirect to errorPage if some error happens to the backend call', async () => {
      spiedGrantMandatoryQuestionServiceGetMandatoryQuestion.mockRejectedValue(
        new Error()
      );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to get the page you requested","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('should redirect to next not answered page if the page we are accessing has already been answered, and the url does not have the fromSummaryPage query param as true', async () => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion,
        { isPageAlreadyAnswered: true }
      );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination: '/nextpage',
          statusCode: 302,
        },
      });
    });
    it('should not redirect to next not answered page if the page we are accessing has already been answered and the url have the fromSummaryPage query param as true', async () => {
      const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
        params: { mandatoryQuestionId: 'mandatoryQuestionId' },
        query: { fromSummaryPage: 'true' },
      });

      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion,
        { isPageAlreadyAnswered: true }
      );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        props: {
          csrfToken: 'testCSRFToken',
          fieldErrors: [],
          formAction: '/testResolvedURL',
          defaultFields: {
            ...getDefaultGrantMandatoryQuestion(),
            isPageAlreadyAnswered: true,
          },
          mandatoryQuestion: {
            ...getDefaultGrantMandatoryQuestion(),
            isPageAlreadyAnswered: true,
          },
          mandatoryQuestionId: 'mandatoryQuestionId',
        },
      });
    });
  });

  describe('when handling a POST request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      req: {
        method: 'POST',
      },
      params: { mandatoryQuestionId: 'mandatoryQuestionId' },
      query: {},
    });
    const getDefaultUpdateResponse = (): string => '/nextpage';
    beforeEach(() => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion
      );
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion,
        getDefaultUpdateResponse
      );
      (parseBody as jest.Mock).mockResolvedValue({
        name: 'test name',
      });
    });

    it('Should update the mandatoryQuestion', async () => {
      await getServerSideProps(getContext(getDefaultContext));

      expect(
        spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion
      ).toHaveBeenNthCalledWith(1, 'testSessionId', 'mandatoryQuestionId', {
        name: 'test name',
      });
    });

    it.skip('Should redirect to the next available page after successfully updating', async () => {
      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination: '/nextpage',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the summary page after successfully updating if query parameter fromSummaryPage is true', async () => {
      const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
        req: {
          method: 'POST',
        },
        params: { mandatoryQuestionId: 'mandatoryQuestionId' },
        query: { fromSummaryPage: 'true' },
      });
      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination: routes.mandatoryQuestions.summaryPage(
            'mandatoryQuestionId'
          ),
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page if there is an error when updating', async () => {
      spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion.mockRejectedValueOnce(
        'Error'
      );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update your organisation details","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('Should return field errors upon a validation error', async () => {
      spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion.mockRejectedValueOnce(
        {
          response: {
            data: {
              errors: [
                {
                  fieldName: 'orgType',
                  errorMessage: 'Some validation error',
                },
              ],
            },
          },
        }
      );

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        props: {
          fieldErrors: [
            { fieldName: 'orgType', errorMessage: 'Some validation error' },
          ],
          csrfToken: 'testCSRFToken',

          formAction: '/testResolvedURL',
          defaultFields: { name: 'test name' },
          mandatoryQuestion: getDefaultGrantMandatoryQuestion(),
          mandatoryQuestionId: 'mandatoryQuestionId',
        },
      });
    });
  });
});
