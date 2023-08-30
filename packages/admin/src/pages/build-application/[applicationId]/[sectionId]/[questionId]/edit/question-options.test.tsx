import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  QuestionSummary,
  QuestionWithOptionsSummary,
} from '../../../../../../types/QuestionSummary';
import QuestionOptions, { getServerSideProps } from './question-options.page';
import { merge } from 'lodash';
import { Redirect } from 'next';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../services/QuestionService';
import NextGetServerSidePropsResponse from '../../../../../../types/NextGetServerSidePropsResponse';
import { parseBody } from 'next/dist/server/api-utils/node';
import { ValidationError } from 'gap-web-ui';
import ResponseTypeEnum from '../../../../../../enums/ResponseType';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../../../../../services/ApplicationService');
jest.mock('../../../../../../services/QuestionService');
jest.mock('../../../../../../services/SessionService');
jest.mock('next/dist/server/api-utils/node', () => ({
  parseBody: jest.fn(),
}));

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

  describe('UI', () => {
    const questionSummary: QuestionSummary = {
      fieldTitle: 'Mock Question With Options',
      hintText: 'This is a test question.',
      optional: 'no',
    };

    const getProps = (overrides: any = {}) =>
      merge(
        {
          sectionName: 'Test Section Name',
          questionSummary: questionSummary,
          backButtonHref: '/mockBackUrl',
          formAction: '/mockSubmitUrl',
          fieldErrors: [],
          options: ['Option one', 'Option two'],
        },
        overrides
      );

    const component = <QuestionOptions {...getProps()} />;

    it('Should render a back button', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/mockBackUrl'
      );
    });

    it('Should render the flexible question page layout', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Should render the question summary', () => {
      render(component);
      screen.getByTestId('options-question-summary');
      screen.getByRole('heading', { name: 'Mock Question With Options' });
      screen.getByText('This is a test question.');
    });

    it('Should render a TextInput for each option', () => {
      render(component);
      const options = screen.getAllByTestId('text-input-component');
      expect(options).toHaveLength(2);
    });

    it('Should title each input with ordinal numbering', () => {
      render(component);
      screen.getByLabelText('Enter the first option');
      screen.getByLabelText('Enter the second option');
    });

    it('Should pre-populate each option with correct option value', () => {
      render(component);
      screen.getByDisplayValue('Option one');
      screen.getByDisplayValue('Option two');
    });

    it('Should NOT render "Delete" button for each option when there are 2 or less options present', () => {
      render(component);
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeFalsy();
    });

    it('Should render "Delete" button for each option when there are 3 or more options present', () => {
      render(
        <QuestionOptions
          {...getProps({
            options: ['Option one', 'Option two', 'Option three'],
          })}
        />
      );
      screen.getByRole('button', { name: 'Delete the first option' });
      screen.getByRole('button', { name: 'Delete the second option' });
      screen.getByRole('button', { name: 'Delete the third option' });
    });

    it('Should render add another option button', () => {
      render(component);
      screen.getByRole('button', { name: 'Add another option' });
    });

    it('Should render "Save and continue" button', () => {
      render(component);
      screen.getByRole('button', { name: 'Save and continue' });
    });

    it('Should render "Cancel" link', () => {
      render(component);
      screen.getByRole('link', { name: 'Cancel' });
    });

    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Edit a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionOptions
          {...getProps({ fieldErrors: parsedValidationErrors })}
        />
      );
      expect(document.title).toBe('Error: Edit a question - Manage a grant');
    });
  });

  describe('getServerSideProps', () => {
    const serviceErrorPageRedirect = {
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the question.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
        statusCode: 302,
      } as Redirect,
    };

    const getContext = (overrides: any = {}) =>
      merge(
        {
          params: {
            applicationId: 'testApplicationId',
            sectionId: 'testSectionId',
            questionId: 'testQuestionId',
          } as Record<string, string>,
          req: {
            method: 'GET',
            cookies: { session_id: '', 'gap-test': 'testSessionId' },
          },
        },
        overrides
      );

    const mockQuestionSummary: QuestionWithOptionsSummary = {
      fieldTitle: 'Test Section Field Title',
      hintText: 'Test hint text',
      optional: 'false',
      responseType: ResponseTypeEnum.Dropdown,
    };

    beforeEach(() => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValue({
        sections: [
          { sectionId: 'testSectionId', sectionTitle: 'Custom section name' },
        ],
        applicationStatus: 'DRAFT',
      });

      process.env.SESSION_COOKIE_NAME = 'gap-test';

      (getQuestion as jest.Mock).mockResolvedValue({
        fieldTitle: 'Test Section Field Title',
        hintText: 'Test hint text',
        validation: { mandatory: 'true' },
        responseType: ResponseTypeEnum.Dropdown,
        options: ['Option one', 'Option two', 'Option three'],
      });
    });

    it('Should return a page caption of the section title', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageCaption).toStrictEqual('Custom section name');
    });

    it('Should return question summary', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.questionSummary).toStrictEqual(mockQuestionSummary);
    });

    it('Should return a back button href', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.backButtonHref).toStrictEqual(
        '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content'
      );
    });

    it('Should return a form action', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.formAction).toStrictEqual(
        '/apply/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-options'
      );
    });

    it('Should return a "Cancel changes" href', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.cancelChangesHref).toStrictEqual(
        '/build-application/testApplicationId/testSectionId/testQuestionId/preview'
      );
    });

    it('Should redirect to the service error page when fetching the question data fails', async () => {
      (getQuestion as jest.Mock).mockRejectedValue({});

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(serviceErrorPageRedirect);
    });

    it('Should redirect to the service error page when fetching the section title fails', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(serviceErrorPageRedirect);
    });

    it('Should redirect to question preview page if the application has been published', async () => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValueOnce({
        applicationStatus: 'PUBLISHED',
      });
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

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
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.options).toStrictEqual([
          'Option one',
          'Option two',
          'Option three',
        ]);
      });
    });

    describe('When handling a POST request', () => {
      const postContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

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
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'add-another-option': '',
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.options).toStrictEqual(['option one', '']);
        });

        it('Should NOT try to update the question options when "Add another option" button is clicked', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'options[2]': 'option three',
            'delete_options[0]': '',
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(patchQuestion).not.toHaveBeenCalled();
        });
      });

      describe('Delete an option', () => {
        it('Should return an array of current options minus one option when "Delete" button for the option is clicked', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'options[2]': 'option three',
            'delete_options[0]': '',
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.options).toStrictEqual([
            'option two',
            'option three',
          ]);
        });

        it('Should NOT try to update the question options when "Delete" button is clicked', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'options[2]': 'option three',
            'delete_options[0]': '',
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(patchQuestion).not.toHaveBeenCalled();
        });
      });

      describe('Save Question', () => {
        it('Should redirect to dashboard after successfully saving the options', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'save-and-continue': '',
          });

          (patchQuestion as jest.Mock).mockResolvedValue({});

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

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

        it('Should redirect to service error page if saving the options throws an error', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'save-and-continue': '',
          });

          (patchQuestion as jest.Mock).mockRejectedValue({});

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result).toStrictEqual(serviceErrorPageRedirect);
        });

        it('Should return field errors if they are returned from the backend.', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'save-and-continue': '',
          });

          (patchQuestion as jest.Mock).mockRejectedValue({
            response: { data: { fieldErrors: validationErrors } },
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldErrors).toStrictEqual(
            parsedValidationErrors
          );
        });

        it('Should parse class level errors into field level errors', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            'options[0]': 'option one',
            'options[1]': 'option two',
            'save-and-continue': '',
          });
          (patchQuestion as jest.Mock).mockRejectedValue({
            response: { data: { fieldErrors: validationErrors } },
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldErrors).toStrictEqual(
            parsedValidationErrors
          );
        });
      });
    });
  });
});
