import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ValidationError } from 'gap-web-ui';
import { merge } from 'lodash';
import { Redirect } from 'next';

import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { postQuestion } from '../../../../services/QuestionService';
import { getSummaryFromSession } from '../../../../services/SessionService';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import { QuestionSummary } from '../../../../types/QuestionSummary';
import { parseBody } from '../../../../utils/parseBody';
import QuestionOptions, { getServerSideProps } from './question-options.page';

jest.mock('../../../../services/ApplicationService');
jest.mock('../../../../services/QuestionService');
jest.mock('../../../../services/SessionService');
jest.mock('../../../../utils/parseBody');

const mockParseBody = jest.mocked(parseBody);

describe('Question Options', () => {
  const parsedValidationErrors = [
    { fieldName: 'options[0]', errorMessage: 'Example error for all options' },
    { fieldName: 'options[1]', errorMessage: 'Example error for all options' },
    {
      fieldName: 'options[1]',
      errorMessage: 'Example error for the second option',
    },
  ] as ValidationError[];

  describe('Options Page Rendering', () => {
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
          options: ['option one', 'option two'],
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

    it('Should renders the flexible question page layout', () => {
      render(component);
      screen.getByTestId('question-page-caption');
    });

    it('Should renders the questions summary', () => {
      render(component);
      screen.getByTestId('options-question-summary');
      screen.getByRole('heading', { name: 'Mock Question With Options' });
      screen.getByText('This is a test question.');
    });

    it('Should render a TextInput for each option', () => {
      render(component);
      const options = screen.getAllByTestId('text-input-component');
      expect(options).toHaveLength(2);
      screen.getByLabelText('Enter the first option');
      screen.getByLabelText('Enter the second option');
    });

    it('Should title each input with ordinal numbering', () => {
      render(component);
      screen.getByLabelText('Enter the first option');
      screen.getByLabelText('Enter the second option');
    });

    it('Should pre-populate each option with correct option value', () => {
      render(component);
      screen.getByDisplayValue('option one');
      screen.getByDisplayValue('option two');
    });

    it('Should render add another option button', () => {
      render(component);
      screen.getByRole('button', { name: 'Add another option' });
    });

    it('Should render save and continue button', () => {
      render(component);
      screen.getByRole('button', { name: 'Save question' });
    });

    it('Should render validtion banner if field errors are present', () => {
      render(
        <QuestionOptions
          {...getProps({ fieldErrors: parsedValidationErrors })}
        />
      );
      screen.getByRole('heading', { name: 'There is a problem' });

      screen.getByRole('link', { name: 'Example error for the second option' });
    });

    it('Should highlight all options for top level errors', () => {
      render(
        <QuestionOptions
          {...getProps({ fieldErrors: parsedValidationErrors })}
        />
      );
      const errors = screen.getAllByText('Example error for all options');
      const optionErrorMessages = screen.getAllByTestId(
        'error-message-test-id'
      );
      expect(errors).toHaveLength(4);
      expect(optionErrorMessages).toHaveLength(2);
    });

    it('Should highlight all single option for option level errors', () => {
      render(
        <QuestionOptions
          {...getProps({
            fieldErrors: [
              {
                fieldName: 'options[1]',
                errorMessage: 'Example error for the second option',
              },
            ],
          })}
        />
      );

      screen.getByTestId('error-message-test-id');
    });

    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Add a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionOptions
          {...getProps({ fieldErrors: parsedValidationErrors })}
        />
      );
      expect(document.title).toBe('Error: Add a question - Manage a grant');
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
      screen.getByRole('button', { name: 'Delete option first' });
      screen.getByRole('button', { name: 'Delete option second' });
      screen.getByRole('button', { name: 'Delete option third' });
    });
  });

  describe('getServerSideProps', () => {
    const serviceErrorPageRedirect = {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify({
          errorInformation:
            'Something went wrong while trying to create the question.',
          linkAttributes: {
            href: '/build-application/applicationId/dashboard',
            linkText: 'Please return',
            linkInformation: ' and try again.',
          },
        })}`,
        statusCode: 302,
      } as Redirect,
    };

    const getContext = (overrides: any = {}) =>
      merge(
        {
          query: {} as Record<string, string>,
          params: {
            applicationId: 'applicationId',
            sectionId: 'sectionId',
          } as Record<string, string>,
          req: {
            method: 'GET',
            cookies: { session_id: 'sessionId', 'gap-test': 'testSessionId' },
          },
          res: { getHeader: () => 'testCSRFToken' },
        },
        overrides
      );

    const mockQuestionSummary: QuestionSummary = {
      fieldTitle: 'Custom Question Name',
      hintText: 'This is a test question',
      optional: 'no',
    };

    beforeEach(() => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValue({
        sections: [
          { sectionId: 'sectionId', sectionTitle: 'Custom section name' },
        ],
      });

      process.env.SESSION_COOKIE_NAME = 'gap-test';

      (getSummaryFromSession as jest.Mock).mockResolvedValue(
        mockQuestionSummary
      );
    });

    describe('When Handing a GET Request', () => {
      it('Should redirect to the service error page when session id isnt found', async () => {
        const result = (await getServerSideProps(
          getContext({ req: { cookies: { session_id: '' } } })
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorPageRedirect);
      });

      it('Should return the section name', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.sectionName).toStrictEqual('Custom section name');
      });

      it('Should return a summary of the question being created', async () => {
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
          '/build-application/applicationId/sectionId/question-type'
        );
      });

      it('Should return a form action href', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.formAction).toStrictEqual(
          '/apply/build-application/applicationId/sectionId/question-options'
        );
      });

      it('Should return two blank options', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.options).toStrictEqual(['', '']);
      });

      it('Should redirect to error page if we are unable to get application summary', async () => {
        (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorPageRedirect);
      });

      it('Should redirect to error page if we are unable to get question summary', async () => {
        (getSummaryFromSession as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorPageRedirect);
      });
    });

    describe('When Handing a POST Request', () => {
      const postContext = (overrides = {}) =>
        getContext(
          merge(
            {
              req: { method: 'POST' },
              res: { getHeader: () => 'testCSRFToken' },
            },
            overrides
          )
        );

      const validationErrors = [
        { fieldName: 'options', errorMessage: 'Example error for all options' },
        {
          fieldName: 'options[1]',
          errorMessage: 'Example error for the second option',
        },
      ] as ValidationError[];

      describe('Add another option', () => {
        it('Should return an array with new empty option when a single option is retrieved from body', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one'],
            'add-another-option': '',
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.options).toStrictEqual(['option one', '']);
        });

        it('Should return options from body if already an array including a new option', async () => {
          const expectedOptionsArray = ['option one', 'option two', ''];
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'add-another-option': '',
          });

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.options).toStrictEqual(expectedOptionsArray);
        });
      });

      describe('Save Question', () => {
        it('Should redirect to dashboard after successfully adding question with options', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-question': '',
          });

          (postQuestion as jest.Mock).mockResolvedValue({});

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(postQuestion).toBeCalledWith(
            'testSessionId',
            'applicationId',
            'sectionId',
            expect.objectContaining({ options: ['option one', 'option two'] })
          );

          expect(result).toStrictEqual({
            redirect: {
              destination: '/build-application/applicationId/sectionId',
              statusCode: 302,
            },
          });
        });

        it('Should redirect to service error page if saving throws an error', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-question': '',
          });

          (postQuestion as jest.Mock).mockRejectedValue({});

          const result = (await getServerSideProps(
            postContext()
          )) as NextGetServerSidePropsResponse;

          expect(result).toStrictEqual(serviceErrorPageRedirect);
        });

        it('Should return field errors if they are returned from the backend.', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-question': '',
          });
          (postQuestion as jest.Mock).mockRejectedValue({
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
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two'],
            'save-question': '',
          });
          (postQuestion as jest.Mock).mockRejectedValue({
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
      describe('Delete an option', () => {
        it('Should return an array of current options minus one option when "Delete" button for the option is clicked', async () => {
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two', 'option three'],
            delete_0: '',
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
          mockParseBody.mockResolvedValue({
            options: ['option one', 'option two', 'option three'],
            delete_0: '',
          });

          await getServerSideProps(postContext());

          expect(postQuestion).not.toHaveBeenCalled();
        });
      });
    });
  });
});
