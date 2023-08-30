import { GetServerSidePropsContext } from 'next';
import {
  expectObjectEquals,
  getContext,
  getProps,
  Optional,
} from '../../utils/UnitTestHelpers';
import { parseBody } from 'next/dist/server/api-utils/node';
import QuestionPageGetServerSideProps from './QuestionPageGetServerSideProps';

jest.mock('next/dist/server/api-utils/node');
jest.mock('csurf', () => {
  return {
    __esModule: true,
    default:
      () =>
      (
        req: GetServerSidePropsContext['req'],
        res: GetServerSidePropsContext['res'],
        callback: (...args: any) => any
      ) => {
        callback({});
      },
  };
});

describe('QuestionPageGetServerSideProps', () => {
  const mockGetDataFunction = jest.fn();
  const mockUpdateDataFunction = jest.fn();

  const getDefaultProps = (): Parameters<
    typeof QuestionPageGetServerSideProps
  >[0] => ({
    context: getContext(),
    fetchPageData: mockGetDataFunction,
    handleRequest: mockUpdateDataFunction,
    jwt: 'testSessionId',
    onErrorMessage: 'Test error message',
    onSuccessRedirectHref: '/testSuccess',
  });

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetDataFunction.mockResolvedValue({ '1': 'testResponse' });
  });

  describe('when handling a GET request', () => {
    it('should return the expected props object', async () => {
      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        props: {
          csrfToken: 'testCSRFToken',
          fieldErrors: [],
          formAction: '/testResolvedURL',
          previousValues: null,
          pageData: { '1': 'testResponse' },
        },
      });
    });

    it('Should call the getData function with the jwt', async () => {
      await QuestionPageGetServerSideProps(getProps(getDefaultProps));

      expect(mockGetDataFunction).toHaveBeenNthCalledWith(1, 'testSessionId');
    });

    it('Should redirect to the error code page if there is an error containing a code when getting data', async () => {
      mockGetDataFunction.mockRejectedValueOnce({
        response: { data: { code: '401' } },
      });

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/error-page/code/401?href=/testResolvedURL',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page if there is an error when getting data', async () => {
      mockGetDataFunction.mockRejectedValueOnce('Error');

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/service-error?excludeSubPath=true&serviceErrorProps={"errorInformation":"Something went wrong while trying to load this page.","linkAttributes":{"href":"%2FtestResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('Should redirect when getting data returns a redirect', async () => {
      mockGetDataFunction.mockResolvedValue({
        redirect: {
          statusCode: 302,
          destination: '/testDestination',
        },
      });

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/testDestination',
          statusCode: 302,
        },
      });
    });
  });

  describe('when handling a POST request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      req: {
        method: 'POST',
      },
    });
    const getDefaultProps = (): Parameters<
      typeof QuestionPageGetServerSideProps
    >[0] => ({
      context: getContext(getDefaultContext),
      fetchPageData: mockGetDataFunction,
      handleRequest: mockUpdateDataFunction,
      jwt: 'testSessionId',
      onErrorMessage: 'Test error message',
      onSuccessRedirectHref: '/testSuccess',
    });

    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({ '1': 'testNewResponse' });
    });

    it('Should call the updateData function with the requests body & jwt', async () => {
      await QuestionPageGetServerSideProps(getProps(getDefaultProps));

      expect(mockUpdateDataFunction).toHaveBeenNthCalledWith(
        1,
        {
          '1': 'testNewResponse',
        },
        'testSessionId'
      );
    });

    it('Should redirect to the success href prop after successfully updating the data', async () => {
      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/testSuccess',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error code page if there is an error containing a code when updating', async () => {
      mockUpdateDataFunction.mockRejectedValueOnce({ code: '401' });

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/error-page/code/401?href=%2FtestResolvedURL',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page if there is an error when updating', async () => {
      mockUpdateDataFunction.mockRejectedValueOnce('Error');

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Test error message","linkAttributes":{"href":"%2FtestResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('Should return field errors upon a validation error', async () => {
      mockUpdateDataFunction.mockRejectedValueOnce({
        response: {
          data: {
            errors: [
              {
                fieldName: 'type',
                errorMessage: 'Some validation error',
              },
            ],
          },
        },
      });

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        props: {
          fieldErrors: [
            { fieldName: 'type', errorMessage: 'Some validation error' },
          ],
          csrfToken: 'testCSRFToken',
          formAction: '/testResolvedURL',
          previousValues: { '1': 'testNewResponse' },
          pageData: { '1': 'testResponse' },
        },
      });
    });
  });
});
