import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { QuestionWithOptionsSummary } from '../../../../../../types/QuestionSummary';
import { getServerSideProps } from './question-options.page';
import { Redirect } from 'next';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../services/QuestionService';
import { parseBody } from '../../../../../../utils/parseBody';
import { Optional, ValidationError, getContext } from 'gap-web-ui';
import ResponseTypeEnum from '../../../../../../enums/ResponseType';
import InferGetServerSideProps from '../../../../../../types/InferGetServerSideProps';

jest.mock('../../../../../../services/ApplicationService');
jest.mock('../../../../../../services/QuestionService');
jest.mock('../../../../../../services/SessionService');
jest.mock('../../../../../../utils/parseBody');

const mockParseBody = jest.mocked(parseBody);
const mockGetApplicationFormSummary = jest.mocked(getApplicationFormSummary);
const mockGetQuestion = jest.mocked(getQuestion);
const mockPatchQuestion = jest.mocked(patchQuestion);

type GetServerSideProps = InferGetServerSideProps<typeof getServerSideProps>;

describe('Question Options', () => {
  const parsedValidationErrors = [
    {
      fieldName: 'options[0]',
      errorMessage: 'Example error for the first option',
    },
    {
      fieldName: 'options[1]',
      errorMessage: 'Example error for the second option',
    },
  ] as ValidationError[];

  describe('getServerSideProps', () => {
    const serviceErrorPageRedirect = {
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the question.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
        statusCode: 302,
      } as Redirect,
    };

    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        applicationId: 'testApplicationId',
        sectionId: 'testSectionId',
        questionId: 'testQuestionId',
      },
      query: {},
    });

    const mockQuestionSummary: QuestionWithOptionsSummary = {
      fieldTitle: 'Test Section Field Title',
      hintText: 'Test hint text',
      optional: 'false',
      responseType: ResponseTypeEnum.Dropdown,
    };

    beforeEach(() => {
      mockGetApplicationFormSummary.mockResolvedValue({
        sections: [
          { sectionId: 'testSectionId', sectionTitle: 'Custom section name' },
        ],
        applicationStatus: 'DRAFT',
        applicationName: 'Test Application Name',
        audit: {
          created: '2021-08-12T14:00:00.000Z',
          lastUpdatedDate: '2021-08-12T14:00:00.000Z',
          lastPublished: '2021-08-12T14:00:00.000Z',
          lastUpdatedBy: 'Test User',
          version: 1,
        },
        grantApplicationId: 'testGrantApplicationId',
        grantSchemeId: 'testGrantSchemeId',
      });

      process.env.SESSION_COOKIE_NAME = 'gap-test';

      mockGetQuestion.mockResolvedValue({
        fieldTitle: 'Test Section Field Title',
        hintText: 'Test hint text',
        validation: { mandatory: 'true' },
        responseType: ResponseTypeEnum.Dropdown,
        options: ['Option one', 'Option two', 'Option three'],
        questionId: 'testQuestionId',
        fieldPrefix: '',
        questionSuffix: '',
        profileField: '',
        adminSummary: '',
        displayText: '',
      });
    });

    it('Should return a page caption of the section title', async () => {
      const result = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as GetServerSideProps;

      expect(result.props.pageCaption).toStrictEqual('Custom section name');
    });

    it('Should return question summary', async () => {
      const result = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as GetServerSideProps;

      expect(result.props.questionSummary).toStrictEqual(mockQuestionSummary);
    });

    it('Should return a back button href', async () => {
      const result = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as GetServerSideProps;

      expect(result.props.backButtonHref).toStrictEqual(
        '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content'
      );
    });

    it('Should return a form action', async () => {
      const result = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as GetServerSideProps;

      expect(result.props.formAction).toStrictEqual(
        '/apply/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-options'
      );
    });

    it('Should return a "Cancel changes" href', async () => {
      const result = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as GetServerSideProps;

      expect(result.props.cancelChangesHref).toStrictEqual(
        '/build-application/testApplicationId/testSectionId'
      );
    });

    it('Should redirect to the service error page when fetching the question data fails', async () => {
      mockGetQuestion.mockRejectedValue({});

      const result = await getServerSideProps(getContext(getDefaultContext));

      expect(result).toStrictEqual(serviceErrorPageRedirect);
    });

    it('Should redirect to the service error page when fetching the section title fails', async () => {
      mockGetApplicationFormSummary.mockRejectedValue({});

      const result = await getServerSideProps(getContext(getDefaultContext));

      expect(result).toStrictEqual(serviceErrorPageRedirect);
    });

    it('Should redirect to question preview page if the application has been published', async () => {
      mockGetApplicationFormSummary.mockResolvedValueOnce({
        applicationStatus: 'PUBLISHED',
      });
      const value = await getServerSideProps(getContext(getDefaultContext));

      expect(value).toStrictEqual({
        redirect: {
          destination:
            '/build-application/testApplicationId/testSectionId/testQuestionId/preview',
          statusCode: 302,
        },
      });
    });

    describe('When handling a GET request', () => {
      it('Should return option values using data from the database', async () => {
        const result = (await getServerSideProps(
          getContext(getDefaultContext)
        )) as GetServerSideProps;

        expect(result.props.options).toStrictEqual([
          'Option one',
          'Option two',
          'Option three',
        ]);
        expect(result.props.cancelChangesHref).toStrictEqual(
          '/build-application/testApplicationId/testSectionId'
        );
        expect(result.props.backButtonHref).toStrictEqual(
          '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content'
        );
      });

      it('Should return correct button links when "backTo" passed in query', async () => {
        const result = (await getServerSideProps(
          getContext(getDefaultContext, { query: { backTo: 'dashboard' } })
        )) as GetServerSideProps;

        expect(result.props.cancelChangesHref).toStrictEqual(
          '/build-application/testApplicationId/dashboard'
        );
        expect(result.props.backButtonHref).toStrictEqual(
          '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content?backTo=dashboard'
        );
      });

      it('Should return correct button links when "from" passed in query', async () => {
        const result = (await getServerSideProps(
          getContext(getDefaultContext, {
            query: { from: 'question-type' },
          })
        )) as GetServerSideProps;

        expect(result.props.cancelChangesHref).toStrictEqual('');
        expect(result.props.backButtonHref).toStrictEqual(
          '/build-application/testApplicationId/testSectionId/question-type?questionId=testQuestionId&sectionId=testSectionId'
        );
      });

      it('Should return correct button links when "backTo" and "from" passed in query', async () => {
        const result = (await getServerSideProps(
          getContext(getDefaultContext, {
            query: { backTo: 'dashboard', from: 'question-type' },
          })
        )) as GetServerSideProps;

        expect(result.props.cancelChangesHref).toStrictEqual('');
        expect(result.props.backButtonHref).toStrictEqual(
          '/build-application/testApplicationId/testSectionId/question-type?backTo=dashboard&questionId=testQuestionId&sectionId=testSectionId'
        );
      });
    });

    describe('When handling a POST request', () => {
      const validationErrors = [
        {
          fieldName: 'options[0]',
          errorMessage: 'Example error for the first option',
        },
        {
          fieldName: 'options[1]',
          errorMessage: 'Example error for the second option',
        },
      ] as ValidationError[];

      describe('Add another option', () => {
        it('Should return an array with current options and a new empty option when a "Add another option" is clicked', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one'],
            'add-another-option': '',
          });

          const result = (await getServerSideProps(
            getContext(getDefaultContext, { req: { method: 'POST' } })
          )) as GetServerSideProps;

          expect(result.props.options).toStrictEqual(['option one', '']);
          expect(patchQuestion).not.toHaveBeenCalled();
        });
      });

      describe('Delete an option', () => {
        it('Should return an array of current options minus one option when "Delete" button for the option is clicked', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two', 'option three'],
            delete_0: '',
          });

          const result = (await getServerSideProps(
            getContext(getDefaultContext, { req: { method: 'POST' } })
          )) as GetServerSideProps;

          expect(result.props.options).toStrictEqual([
            'option two',
            'option three',
          ]);
        });

        it('Should NOT try to update the question options when "Delete" button is clicked', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two', 'option three'],
            delete_0: '',
          });

          await getServerSideProps(
            getContext(getDefaultContext, { req: { method: 'POST' } })
          );

          expect(patchQuestion).not.toHaveBeenCalled();
        });
      });

      describe('Save Question', () => {
        it('Should redirect to dashboard after successfully saving the options', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-and-continue': '',
          });

          mockPatchQuestion.mockResolvedValue({});

          const result = await getServerSideProps(
            getContext(getDefaultContext, {
              req: { method: 'POST' },
              query: { backTo: 'dashboard' },
            })
          );

          expect(patchQuestion).toBeCalledWith(
            'testSessionId',
            'testApplicationId',
            'testSectionId',
            'testQuestionId',
            expect.objectContaining({ options: ['option one', 'option two'] })
          );

          expect(result).toStrictEqual({
            redirect: {
              destination: '/build-application/testApplicationId/dashboard',
              statusCode: 302,
            },
          });
        });

        it('Should redirect to edit question page after successfully saving the options', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-and-continue': '',
          });

          mockPatchQuestion.mockResolvedValue({});

          const result = await getServerSideProps(
            getContext(getDefaultContext, {
              req: { method: 'POST' },
              query: { from: 'question-type' },
            })
          );

          expect(patchQuestion).toBeCalledWith(
            'testSessionId',
            'testApplicationId',
            'testSectionId',
            'testQuestionId',
            expect.objectContaining({ options: ['option one', 'option two'] })
          );

          expect(result).toStrictEqual({
            redirect: {
              destination:
                '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content',
              statusCode: 302,
            },
          });
        });

        it('Should redirect to edit question page with dashboard param after successfully saving the options', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-and-continue': '',
          });

          mockPatchQuestion.mockResolvedValue({});

          const result = await getServerSideProps(
            getContext(getDefaultContext, {
              req: { method: 'POST' },
              query: { from: 'question-type', backTo: 'dashboard' },
            })
          );

          expect(patchQuestion).toBeCalledWith(
            'testSessionId',
            'testApplicationId',
            'testSectionId',
            'testQuestionId',
            expect.objectContaining({ options: ['option one', 'option two'] })
          );

          expect(result).toStrictEqual({
            redirect: {
              destination:
                '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content?backTo=dashboard',
              statusCode: 302,
            },
          });
        });

        it('Should redirect to service error page if saving the options throws an error', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-and-continue': '',
          });

          mockPatchQuestion.mockRejectedValue({});

          const result = await getServerSideProps(
            getContext(getDefaultContext, { req: { method: 'POST' } })
          );

          expect(result).toStrictEqual(serviceErrorPageRedirect);
        });

        it('Should return field errors if they are returned from the backend.', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-and-continue': '',
          });

          mockPatchQuestion.mockRejectedValue({
            response: { data: { fieldErrors: validationErrors } },
          });

          const result = (await getServerSideProps(
            getContext(getDefaultContext, { req: { method: 'POST' } })
          )) as GetServerSideProps;

          expect(result.props.fieldErrors).toStrictEqual(
            parsedValidationErrors
          );
        });

        it('Should parse class level errors into field level errors', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-and-continue': '',
          });
          mockPatchQuestion.mockRejectedValue({
            response: { data: { fieldErrors: validationErrors } },
          });

          const result = (await getServerSideProps(
            getContext(getDefaultContext, { req: { method: 'POST' } })
          )) as GetServerSideProps;

          expect(result.props.fieldErrors).toStrictEqual(
            parsedValidationErrors
          );
        });
      });
    });
  });
});
