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
import { generateRedirectForMandatoryQuestionNextPage } from '../../../utils/generateRedirectForMandatoryQuestionNextPage';
import { routes } from '../../../utils/routes';
import getServerSideProps from './getServerSideProps';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../utils/generateRedirectForMandatoryQuestionNextPage');

const spiedGrantMandatoryQuestionServiceGetMandatoryQuestion = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'getMandatoryQuestionById'
);

const spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'updateMandatoryQuestion'
);

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
  });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.USER_TOKEN_NAME = 'gap-test';
  });

  describe('when handling a GET request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      query: { mandatoryQuestionId: 'mandatoryQuestionId' },
    });

    it('should return the right props', async () => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion
      );
      (
        generateRedirectForMandatoryQuestionNextPage as jest.Mock
      ).mockReturnValue({ redirect: { destination: '/nextpage' } });

      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        props: {
          csrfToken: 'testCSRFToken',
          fieldErrors: [],
          formAction: '/testResolvedURL',
          backButtonUrl: routes.mandatoryQuestions.startPage('1'),
          mandatoryQuestion: getDefaultGrantMandatoryQuestion(),
          defaultFields: '',
        },
      });
    });

    it('Should call getMandatoryQuestionById', async () => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion
      );
      (
        generateRedirectForMandatoryQuestionNextPage as jest.Mock
      ).mockReturnValue({ redirect: { destination: '/nextpage' } });

      await getServerSideProps(getContext(getDefaultContext));

      expect(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion
      ).toHaveBeenNthCalledWith(1, 'testSessionId', 'mandatoryQuestionId');
    });
  });

  describe('when handling a POST request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      req: {
        method: 'POST',
      },
      query: { mandatoryQuestionId: 'mandatoryQuestionId' },
    });

    beforeEach(() => {
      mockServiceMethod(
        spiedGrantMandatoryQuestionServiceGetMandatoryQuestion,
        getDefaultGrantMandatoryQuestion
      );
      (parseBody as jest.Mock).mockResolvedValue({
        name: 'test name',
      });
      (
        generateRedirectForMandatoryQuestionNextPage as jest.Mock
      ).mockReturnValue({ redirect: { destination: '/nextpage' } });
    });

    it('Should update the mandatoryQuestion', async () => {
      await getServerSideProps(getContext(getDefaultContext));

      expect(
        spiedGrantMandatoryQuestionServiceUpdateMandatoryQuestion
      ).toHaveBeenNthCalledWith(1, 'testSessionId', 'mandatoryQuestionId', {
        name: 'test name',
      });
    });

    it('Should redirect to the next available page after successfully updating', async () => {
      const response = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination: '/nextpage',
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
          backButtonUrl: routes.mandatoryQuestions.startPage('1'),
          mandatoryQuestion: getDefaultGrantMandatoryQuestion(),
          defaultFields: { name: 'test name' },
        },
      });
    });
  });
});
