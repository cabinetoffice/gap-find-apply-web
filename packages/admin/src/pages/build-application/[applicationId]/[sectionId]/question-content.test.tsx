import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionContent, { getServerSideProps } from './question-content.page';
import { merge } from 'lodash';
import { Redirect } from 'next';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import {
  addFieldsToSession,
  getSummaryFromSession,
} from '../../../../services/SessionService';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import { ValidationError } from 'gap-web-ui';
import { parseBody } from 'next/dist/server/api-utils/node';
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
jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../services/SessionService');
jest.mock('../../../../services/ApplicationService');

const customProps = {
  fieldErrors: [],
  backButtonHref: '/dashboard',
  formAction: '',
  pageCaption: 'Some page caption',
  defaultValue: '',
  fieldTitle: '',
  hintText: '',
  optional: '',
};

const expectedRedirectObject = {
  redirect: {
    destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create the question.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
    statusCode: 302,
  } as Redirect,
};
const component = <QuestionContent {...customProps} />;

describe('Question content page', () => {
  describe('UI', () => {
    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Add a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionContent
          {...customProps}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );

      expect(document.title).toBe('Error: Add a question - Manage a grant');
    });

    it('Should render a back button with correct link on it', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/dashboard'
      );
    });

    it('Renders the question page layout output', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Renders text input field for question name', () => {
      render(component);
      screen.getByTestId('text-input-component');
    });

    it('Renders text area with character counter for question description', () => {
      render(component);
      screen.getByTestId('text-area-component');
      screen.getByTestId('character-limit-div');
    });

    it('Renders radio section to determine whether the question is mandatory', () => {
      render(component);
      screen.getByTestId('radioFormDiv');
    });

    it('Renders "Save and continue" button', () => {
      render(component);
      screen.getByRole('button', { name: 'Save and continue' });
    });
  });

  describe('getServerSideProps', () => {
    beforeEach(() => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValue({
        sections: [
          { sectionId: 'testSectionId', sectionTitle: 'Custom section name' },
        ],
      });
    });

    const getContext = (overrides: any = {}) =>
      merge(
        {
          params: {
            applicationId: 'testApplicationId',
            sectionId: 'testSectionId',
          } as Record<string, string>,
          req: {
            method: 'GET',
            cookies: { session_id: '' },
          },
          res: { setHeader: jest.fn() },
          resolvedUrl:
            '/build-application/testApplicationId/testSectionId/question-content',
        },
        overrides
      );

    it('Should return a back button href', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.backButtonHref).toStrictEqual(
        '/build-application/testApplicationId/dashboard'
      );
    });

    it('Should return a form action', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.formAction).toStrictEqual(
        '/build-application/testApplicationId/testSectionId/question-content'
      );
    });

    it('Should return a page caption of the section title', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.pageCaption).toStrictEqual('Custom section name');
    });

    it('Should redirect to the service error page when fetching the section title fails', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });

    it('Should redirect to the error service page when fetching the summary from the session fails', async () => {
      (getSummaryFromSession as jest.Mock).mockRejectedValue({});

      const value = (await getServerSideProps(
        getContext({
          req: {
            cookies: { session_id: 'testSessionId' },
          },
        })
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });

    describe('when handling a GET request', () => {
      it('Should NOT attempt to add fields to the session', async () => {
        await getServerSideProps(getContext());
        expect(addFieldsToSession).not.toHaveBeenCalled();
      });

      it('Should return an empty array of field errors', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.fieldErrors).toStrictEqual([]);
      });

      it('Should return an empty default field title', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.fieldTitle).toStrictEqual('');
      });

      it('Should return an empty default hint text', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.hintText).toStrictEqual('');
      });

      it('Should return empty string for the optional default value', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.optional).toStrictEqual('');
      });

      it('Should redirect to the error service page when fetching the summary from the session fails', async () => {
        (getSummaryFromSession as jest.Mock).mockRejectedValue({});

        const value = (await getServerSideProps(
          getContext({
            req: {
              cookies: { session_id: 'testSessionId' },
            },
          })
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual(expectedRedirectObject);
      });

      it('Should retain the default values from the session when the session id exists', async () => {
        (getSummaryFromSession as jest.Mock).mockResolvedValue({
          fieldTitle: 'Default field title',
          hintField: 'Default hint field',
          optional: 'true',
        });

        const value = (await getServerSideProps(
          getContext({
            req: {
              cookies: { session_id: 'testSessionId' },
            },
          })
        )) as NextGetServerSidePropsResponse;

        expect(value.props.fieldTitle).toStrictEqual('Default field title');
        expect(value.props.hintField).toStrictEqual('Default hint field');
        expect(value.props.optional).toStrictEqual('true');
      });
    });

    describe('when handling a POST request', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          fieldTitle: 'Title',
          hintText: 'A hint describing the question',
          optional: 'true',
        });
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should redirect to the error service page when adding the fields to the session fails', async () => {
        (addFieldsToSession as jest.Mock).mockRejectedValue({});

        const value = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual(expectedRedirectObject);
      });

      it('Should redirect to the question type page when adding the fields to the session succeeds', async () => {
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          session_id: 'SESSION',
        });

        const value = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual({
          redirect: {
            destination:
              '/build-application/testApplicationId/testSectionId/question-type',
            statusCode: 302,
          },
        });
      });

      describe('Throws validation errors', () => {
        const validationErrors = [
          { fieldName: 'name', errorMessage: 'Please enter a name' },
          {
            fieldName: 'description',
            errorMessage: 'Please enter a description',
          },
        ] as ValidationError[];

        beforeEach(() => {
          (addFieldsToSession as jest.Mock).mockRejectedValue({
            response: {
              data: { fieldErrors: validationErrors },
            },
          });
        });

        it('Should return a list of field errors when adding the fields to the session', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldErrors).toStrictEqual(validationErrors);
        });

        it('Should return a default value of the previously entered field title when adding the fields to the session', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldTitle).toStrictEqual('Title');
        });

        it('Should return a default value of the previously entered hint text when adding the fields to the session', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.hintText).toStrictEqual(
            'A hint describing the question'
          );
        });

        it('Should return a default value of the previously entered optional field when adding the fields to the session', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.optional).toStrictEqual('true');
        });
      });
    });
  });
});
