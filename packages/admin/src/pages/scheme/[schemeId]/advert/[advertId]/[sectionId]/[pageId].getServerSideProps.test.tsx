import '@testing-library/jest-dom';
import { htmlToRichText } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import { parseBody } from 'next/dist/server/api-utils/node';
import {
  getAdvertSectionPageContent,
  patchAdvertSectionPage,
} from '../../../../../../services/AdvertPageService';
import {
  expectObjectEquals,
  getContext,
  InferServiceMethodResponse,
  mockServiceMethod,
  Optional,
  toHaveBeenCalledWith,
} from '../../../../../../testUtils/unitTestHelpers';
import { getServerSideProps } from './[pageId].getServerSideProps';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../../../services/AdvertPageService');
jest.mock('gap-web-ui');

const mockedGetAdvertSectionPageContent =
  getAdvertSectionPageContent as jest.MockedFn<
    typeof getAdvertSectionPageContent
  >;

const mockedPatchAdvertSectionPage = patchAdvertSectionPage as jest.MockedFn<
  typeof patchAdvertSectionPage
>;

const getDefaultPageContent = (): InferServiceMethodResponse<
  typeof getAdvertSectionPageContent
> => ({
  sectionName: 'testSectionName',
  pageTitle: 'testPageTitle',
  questions: [
    {
      questionId: 'testQuestionId',
      questionTitle: 'Test question title',
      hintText: 'Test hint text',
      options: [],
      responseType: 'SHORT_TEXT',
      response: {
        id: 'testResponseId',
        seen: false,
        response: 'Test response',
        multiResponse: [],
      },
    },
  ],
  previousPageId: 'testPreviousPageId',
  nextPageId: 'testNextPageId',
  status: 'NOT_STARTED',
});

describe('The advert question pages getServerSideProps component', () => {
  beforeEach(() => {
    process.env.SESSION_COOKIE_NAME = 'gap-test';
    process.env.TINYMCE_API_KEY = 'testApiKey';
    mockServiceMethod(mockedGetAdvertSectionPageContent, getDefaultPageContent);
  });

  describe('When handling a GET request', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'testSchemeId',
        advertId: 'testAdvertId',
        sectionId: 'testSectionId',
        pageId: 'testPageId',
      },
    });

    it('Should fetch the advertSectionPageContent', async () => {
      await getServerSideProps(getContext(getDefaultContext));

      toHaveBeenCalledWith(
        mockedGetAdvertSectionPageContent,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId'
      );
    });

    it('Should return the correct props', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        props: {
          advertId: 'testAdvertId',
          csrfToken: 'testCSRFToken',
          fieldErrors: [],
          formAction: '/testResolvedURL',
          schemeId: 'testSchemeId',
          previousValues: null,
          pageId: 'testPageId',
          tinyMceApiKey: 'testApiKey',
          ...getDefaultPageContent(),
        },
      });
    });

    it('Should redirect to a service error page when fetching the page contents fails', async () => {
      mockedGetAdvertSectionPageContent.mockRejectedValue({
        response: {
          data: {
            code: '401',
          },
        },
      });

      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        redirect: {
          destination:
            '/error-page/code/401?href=/scheme/testSchemeId/advert/testAdvertId/section-overview',
          statusCode: 302,
        },
      });
    });

    it('Should NOT call patchAdvertSectionPage', async () => {
      await getServerSideProps(getContext(getDefaultContext));

      expect(mockedPatchAdvertSectionPage).not.toHaveBeenCalled();
    });
  });

  describe('When handling a POST request', () => {
    const defaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'testSchemeId',
        advertId: 'testAdvertId',
        sectionId: 'testSectionId',
        pageId: 'testPageId',
      },
      req: { method: 'POST' },
    });

    it('Should call patchAdvertSectionPage with a question type of "SHORT_ANSWER"', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'Yes',
        testQuestionId: 'New test question response',
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'COMPLETED',
          questions: [
            {
              id: 'testQuestionId',
              response: 'New test question response',
              seen: true,
            },
          ],
        }
      );
    });

    it('Should call patchAdvertSectionPage with a question type of "SHORT_ANSWER" & the section was NOT marked as complete', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'No',
        testQuestionId: 'New test question response',
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'IN_PROGRESS',
          questions: [
            {
              id: 'testQuestionId',
              response: 'New test question response',
              seen: true,
            },
          ],
        }
      );
    });

    it('Should call patchAdvertSectionPage with a question type of "LIST" & there is only one entry in the list', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          questions: [{ responseType: 'LIST' }],
        }
      );
    });

    it('Should call patchAdvertSectionPage with a question type of "LIST" & there is only one entry in the list', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          questions: [{ responseType: 'LIST' }],
        }
      );

      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'Yes',
        testQuestionId: 'New test question response',
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'COMPLETED',
          questions: [
            {
              id: 'testQuestionId',
              multiResponse: ['New test question response'],
              seen: true,
            },
          ],
        }
      );
    });

    it('Should call patchAdvertSectionPage with a question type of "LIST" & there are multiple entries in the list', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          questions: [{ responseType: 'LIST' }],
        }
      );

      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'Yes',
        testQuestionId: ['New test question response', 'test response 2'],
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'COMPLETED',
          questions: [
            {
              id: 'testQuestionId',
              multiResponse: ['New test question response', 'test response 2'],
              seen: true,
            },
          ],
        }
      );
    });

    it('Should call patchAdvertSectionPage with a question type of "DATE"', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          questions: [
            { responseType: 'DATE', questionId: 'grantApplicationOpenDate' },
          ],
        }
      );

      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'Yes',
        'grantApplicationOpenDate-day': '15',
        'grantApplicationOpenDate-month': '06',
        'grantApplicationOpenDate-year': '2023',
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'COMPLETED',
          questions: [
            {
              id: 'grantApplicationOpenDate',
              multiResponse: ['15', '06', '2023'],
              seen: true,
            },
          ],
        }
      );
    });

    it('Should redirect to an error service page if patchAdvertSectionPage fails', async () => {
      mockedPatchAdvertSectionPage.mockRejectedValue({});

      const response = await getServerSideProps(getContext(defaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update this question","linkAttributes":{"href":"/scheme/testSchemeId/advert/testAdvertId/testSectionId/testPageId","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the next page if save and continue was pressed AND there is a nextPageId', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        saveAndContinue: true,
      });

      const response = await getServerSideProps(getContext(defaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/scheme/testSchemeId/advert/testAdvertId/testSectionId/testNextPageId',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the section overview screen if save and exit was pressed', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        saveAndExit: true,
      });

      const response = await getServerSideProps(getContext(defaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/scheme/testSchemeId/advert/testAdvertId/section-overview',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the section overview screen if there is NOT a nextPageId', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          nextPageId: null,
        }
      );
      (parseBody as jest.Mock).mockResolvedValue({
        saveAndContinue: true,
      });

      const response = await getServerSideProps(getContext(defaultContext));

      expectObjectEquals(response, {
        redirect: {
          destination:
            '/scheme/testSchemeId/advert/testAdvertId/section-overview',
          statusCode: 302,
        },
      });
    });

    it('Should return previousValues & fieldErrors if there are validation errors', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        testQuestionId: 'New test question response',
      });

      mockedPatchAdvertSectionPage.mockRejectedValue({
        response: {
          data: {
            fieldErrors: [
              {
                fieldName: 'testQuestionId',
                errorMessage: 'Error with testQuestionId',
              },
            ],
          },
        },
      });

      const response = await getServerSideProps(getContext(defaultContext));

      expectObjectEquals(response, {
        props: {
          advertId: 'testAdvertId',
          csrfToken: 'testCSRFToken',
          formAction: '/testResolvedURL',
          schemeId: 'testSchemeId',
          pageId: 'testPageId',
          tinyMceApiKey: 'testApiKey',
          ...getDefaultPageContent(),
          fieldErrors: [
            {
              fieldName: 'testQuestionId',
              errorMessage: 'Error with testQuestionId',
            },
          ],
          previousValues: {
            testQuestionId: 'New test question response',
          },
        },
      });
    });

    it('Should call patchAdvertSectionPage with a question type of "RICH_TEXT" and Js disabled', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          questions: [{ responseType: 'RICH_TEXT' }],
        }
      );

      (htmlToRichText as jest.Mock).mockResolvedValue('mockedHtmlToRichText');
      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'Yes',
        testQuestionId: 'testValue',
        jsDisabled: 'true',
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'COMPLETED',
          questions: [
            {
              id: 'testQuestionId',
              multiResponse: [
                '<p>testValue</p>',
                JSON.stringify('mockedHtmlToRichText'),
              ],
              seen: true,
            },
          ],
        }
      );
    });

    it('Should call patchAdvertSectionPage with a question type of "RICH_TEXT" and Js enabled', async () => {
      mockServiceMethod(
        mockedGetAdvertSectionPageContent,
        getDefaultPageContent,
        {
          questions: [{ responseType: 'RICH_TEXT' }],
        }
      );
      (htmlToRichText as jest.Mock).mockResolvedValue('mockedHtmlToRichText');
      (parseBody as jest.Mock).mockResolvedValue({
        completed: 'Yes',
        testQuestionId: '<a>testValue</a>',
      });

      await getServerSideProps(getContext(defaultContext));

      toHaveBeenCalledWith(
        mockedPatchAdvertSectionPage,
        1,
        'testSessionId',
        'testAdvertId',
        'testSectionId',
        'testPageId',
        {
          status: 'COMPLETED',
          questions: [
            {
              id: 'testQuestionId',
              multiResponse: [
                '<a>testValue</a>',
                JSON.stringify('mockedHtmlToRichText'),
              ],
              seen: true,
            },
          ],
        }
      );
    });
  });
});
