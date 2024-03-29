import { GetServerSidePropsContext } from 'next';
import { expectObjectEquals, getContext, getProps, Optional } from 'gap-web-ui';
import { parseBody } from './parseBody';
import QuestionPageGetServerSideProps from './QuestionPageGetServerSideProps';

jest.mock('./parseBody');

describe('QuestionPageGetServerSideProps', () => {
  const mockGetDataFunction = jest.fn();
  const mockUpdateDataFunction = jest.fn();

  const getDefaultProps = (): Parameters<
    typeof QuestionPageGetServerSideProps
  >[0] => ({
    context: getContext(() => ({ res: { getHeader: () => 'testCSRFToken' } })),
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
          formAction: process.env.SUB_PATH + '/testResolvedURL',
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

    it('should redirect to the multiple editors error page', async () => {
      mockGetDataFunction.mockRejectedValueOnce({
        config: { url: '/application-forms/application-id' },
        response: {
          data: {
            error: { message: 'MULTIPLE_EDITORS_SECTION_DELETED' },
          },
        },
      });

      const response = await QuestionPageGetServerSideProps(
        getProps(getDefaultProps)
      );

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/build-application/application-id/error-multiple-editors?error=The section or question you were editing has been deleted and your changes could not be saved.',
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
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to load this page.","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
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
      res: { getHeader: () => 'testCSRFToken' },
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
        'testSessionId',
        { '1': 'testResponse' }
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
          destination: '/error-page/code/401?href=/testResolvedURL',
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
            '/service-error?serviceErrorProps={"errorInformation":"Test error message","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}',
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
          formAction: process.env.SUB_PATH + '/testResolvedURL',
          previousValues: { '1': 'testNewResponse' },
          pageData: { '1': 'testResponse' },
        },
      });
    });
  });
});
