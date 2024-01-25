import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import QuestionType, { getServerSideProps } from './question-type.page';
import { merge } from 'lodash';
import axios from 'axios';
import { parseBody } from 'next/dist/server/api-utils/node';
import {
  getSummaryFromSession,
  addFieldsToSession,
  getValueFromSession,
} from '../../../../services/SessionService';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { ValidationError } from 'gap-web-ui';

jest.mock('axios');
jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../services/SessionService');
jest.mock('../../../../services/ApplicationService');

describe('Question type', () => {
  describe('Question type page', () => {
    const getProps = (overrides: any = {}) =>
      merge(
        {
          sectionName: 'Custom section name',
          backButtonHref: '/back',
          formAction: '#',
          fieldErrors: [],
        },
        overrides
      );

    const component = <QuestionType {...getProps()} />;

    it('Should render a back button', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/back'
      );
    });

    it('Should render the question page layout output', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Should render a hint for the short answer radio option', () => {
      render(component);
      screen.getByText('Short answer');
    });

    it('Should render a page caption with the passed in sectionName', () => {
      render(component);
      screen.getByText('Custom section name');
    });

    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Add a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionType
          {...getProps({
            fieldErrors: [{ fieldName: 'anything', errorMessage: 'Error' }],
          })}
        />
      );

      expect(document.title).toBe('Error: Add a question - Manage a grant');
    });

    it('Should have a short answer', () => {
      render(component);
      screen.getByRole('radio', { name: 'Short answer' });
      screen.getByText('Can have a maximum of 250 characters entered.');
    });

    it('Should have a long answer', () => {
      render(component);
      screen.getByRole('radio', { name: 'Long answer' });
      screen.getByText('Can have a maximum of 6000 characters entered.');
    });

    it('Should have a radio answer', () => {
      render(component);
      screen.getByRole('radio', { name: 'Yes/No' });
      screen.getByText('Allows one option to be selected.');
    });

    it('Should have a multiple choice answer', () => {
      render(component);
      const multipleChoiceRadio = screen.getByRole('radio', {
        name: 'Multiple choice',
      }) as HTMLInputElement;
      expect(multipleChoiceRadio.value).toBe('Dropdown');
      screen.getByText('Allows just one option to be selected from multiple.');
    });

    it('Should have a multiple select answer', () => {
      render(component);
      const MultipleSelectionRadio = screen.getByRole('radio', {
        name: 'Multiple select',
      }) as HTMLInputElement;
      expect(MultipleSelectionRadio.value).toBe('MultipleSelection');
      screen.getByText(
        'Allows more than one option to be selected from multiple.'
      );
    });

    it('Should have a document upload answer', () => {
      render(component);
      screen.getByRole('radio', { name: 'Document upload' });
      screen.getByText(
        'Allows files that are .DOC, .DOCX, .ODT, .PDF, .XLS, .XLSX or .ZIP'
      );
    });

    it('Should have a date answer', () => {
      render(component);
      screen.getByRole('radio', { name: 'Date' });
      screen.getByText('Allows a DD/MM/YYYY format to be entered.');
    });

    it('Should select a default radio if defaultRadio is provided', () => {
      render(
        <QuestionType {...getProps({ defaultRadio: 'Multiple choice' })} />
      );
      const defaultRadio = screen.getByRole('radio', {
        name: 'Multiple choice',
      });
      expect(defaultRadio).toBeChecked();
    });
  });

  describe('getServerSideProps', () => {
    const getContext = (overrides: any = {}) =>
      merge(
        {
          params: {
            applicationId: 'applicationId',
            sectionId: 'sectionId',
          } as Record<string, string>,
          req: {
            method: 'GET',
            cookies: { session_id: 'test-session-id' },
          },
        },
        overrides
      );

    const serviceErrorRedirect = {
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
      },
    };

    beforeEach(() => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValue({
        sections: [
          { sectionId: 'sectionId', sectionTitle: 'Custom section name' },
        ],
      });
      process.env.SESSION_COOKIE_NAME = 'test-session-id';
    });

    describe('when handling a GET request', () => {
      it('Should redirect to the service error page when session id isnt found', async () => {
        const result = (await getServerSideProps(
          getContext({ req: { cookies: { session_id: '' } } })
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorRedirect);
      });

      it('Should return a section name', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.sectionName).toStrictEqual('Custom section name');
      });

      it('Should redirect to the error service page when fetching the section name fails', async () => {
        (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorRedirect);
      });

      it('Should return a back button href', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.backButtonHref).toStrictEqual(
          '/build-application/applicationId/sectionId/question-content'
        );
      });

      it('Should return a form action that posts to the same page', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.formAction).toStrictEqual(
          '/apply/build-application/applicationId/sectionId/question-type'
        );
      });

      it('Should return an empty list of field errors', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.fieldErrors).toStrictEqual([]);
      });

      it('Should not attempt to create the question for a GET request', async () => {
        await getServerSideProps(getContext());

        expect(axios.post).not.toHaveBeenCalled();
      });

      it('Should not attempt to fetch the question summary from the session for a GET request', async () => {
        await getServerSideProps(getContext());

        expect(getSummaryFromSession).not.toHaveBeenCalled();
      });

      it('Should return empty defaultChecked string if no responseType exists in session', async () => {
        (getValueFromSession as jest.Mock).mockResolvedValue(null);

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.defaultRadio).toStrictEqual('');
      });

      it('Should return defaultChecked string of Multiple choice if responseType is Dropdown', async () => {
        (getValueFromSession as jest.Mock).mockResolvedValue('Dropdown');

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.defaultRadio).toStrictEqual('Multiple choice');
      });

      it('Should return defaultChecked string of Multiple select if responseType is MultipleSelection', async () => {
        (getValueFromSession as jest.Mock).mockResolvedValue(
          'MultipleSelection'
        );

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.defaultRadio).toStrictEqual('Multiple select');
      });
    });

    describe('when handling a POST request', () => {
      const getPostContext = (overrides: any = {}) =>
        getContext(
          merge(
            { req: { method: 'POST', cookies: { session_id: 'ssessionId' } } },
            overrides
          )
        );

      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          responseType: 'ShortAnswer',
        });
        (getSummaryFromSession as jest.Mock).mockResolvedValue({
          fieldTitle: 'Field title',
          hintField: 'Hint field',
          displayText: 'Display text',
          mandatory: 'true',
        });
      });

      it('Should redirect to the service error page when fetching from the session fails', async () => {
        (getSummaryFromSession as jest.Mock).mockRejectedValueOnce({});

        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorRedirect);
      });

      it('Should redirect to the dashboard when posting succeeds', async () => {
        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination: '/build-application/applicationId/sectionId',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the error service page when posting fails (and it is not a validation error)', async () => {
        (axios.post as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(serviceErrorRedirect);
      });

      describe('question type with options', () => {
        beforeEach(() => {
          (parseBody as jest.Mock).mockResolvedValue({
            responseType: 'Dropdown',
          });
          (addFieldsToSession as jest.Mock).mockResolvedValue({
            data: '',
            sessionId: 'mock-session-id',
          });
        });

        it('Should add responseType to session if options are needed', async () => {
          await getServerSideProps(getPostContext({}));

          expect(addFieldsToSession).toBeCalled();
        });

        it('Should redirect to the question options page.', async () => {
          (addFieldsToSession as jest.Mock).mockResolvedValue({
            data: '',
            sessionId: 'mock-session-id',
          });

          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result).toStrictEqual({
            redirect: {
              destination:
                '/build-application/applicationId/sectionId/question-options',
              statusCode: 302,
            },
          });
        });

        it('Should redirect to the error service page when adding to session fails', async () => {
          (addFieldsToSession as jest.Mock).mockRejectedValue({});

          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result).toStrictEqual(serviceErrorRedirect);
        });
      });

      describe('Validation errors', () => {
        const validationErrors = [
          { fieldName: 'name', errorMessage: 'Please enter a name' },
          {
            fieldName: 'description',
            errorMessage: 'Please enter a description',
          },
        ] as ValidationError[];

        beforeEach(() => {
          (axios.post as jest.Mock).mockRejectedValue({
            response: { data: { fieldErrors: validationErrors } },
          });
        });

        it('Should return a list of field errors when posting fails due to validation errors', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldErrors).toStrictEqual(validationErrors);
        });

        it('Should return a section name when posting fails due to validation errors', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.sectionName).toStrictEqual('Custom section name');
        });

        it('Should return a back button href when posting fails due to validation errors', async () => {
          const result = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.backButtonHref).toStrictEqual(
            '/build-application/applicationId/sectionId/question-content'
          );
        });

        it('Should return a form action that posts to the same page', async () => {
          const result = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(result.props.formAction).toStrictEqual(
            '/apply/build-application/applicationId/sectionId/question-type'
          );
        });
      });
    });
  });
});
