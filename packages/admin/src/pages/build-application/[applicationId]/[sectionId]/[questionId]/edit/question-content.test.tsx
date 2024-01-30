import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionContent, { getServerSideProps } from './question-content.page';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import NextGetServerSidePropsResponse from '../../../../../../types/NextGetServerSidePropsResponse';
import { ValidationError } from 'gap-web-ui';
import { parseBody } from '../../../../../../utils/parseBody';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../services/QuestionService';

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
jest.mock('../../../../../../utils/parseBody');
jest.mock('../../../../../../services/ApplicationService');
jest.mock('../../../../../../services/QuestionService');

const customProps = {
  fieldErrors: [],
  backButtonHref: '/back',
  formAction: '',
  pageCaption: 'Some page caption',
  defaultValue: '',
  fieldTitle: '',
  hintText: '',
  optional: '',
  csrfToken: '',
};

const expectedRedirectObject = {
  redirect: {
    destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the question.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
    statusCode: 302,
  } as Redirect,
};
const component = <QuestionContent {...customProps} />;

describe('Question content page', () => {
  describe('UI', () => {
    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Edit a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionContent
          {...customProps}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );

      expect(document.title).toBe('Error: Edit a question - Manage a grant');
    });

    it('Should render a back button with correct link on it', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/back'
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

    it('Renders "Cancel" link', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute(
        'href',
        '/apply/back'
      );
    });
  });

  describe('getServerSideProps', () => {
    beforeEach(() => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValue({
        sections: [
          { sectionId: 'testSectionId', sectionTitle: 'Custom section name' },
        ],
        applicationStatus: 'DRAFT',
      });

      (getQuestion as jest.Mock).mockResolvedValue({
        fieldTitle: 'Test Section Field Title',
        hintText: 'Test hint text',
        validation: { mandatory: 'true' },
        responseType: 'ShortAnswer',
      });
    });

    const getContext = (overrides = {}) =>
      merge(
        {
          params: {
            applicationId: 'testApplicationId',
            sectionId: 'testSectionId',
            questionId: 'testQuestionId',
          } as Record<string, string>,
          req: {
            method: 'GET',
            cookies: { session_id: '' },
          },
          res: { setHeader: jest.fn(), getHeader: () => 'testCSRFToken' },
          resolvedUrl:
            '/build-application/testApplicationId/testSectionId/edit/question-content',
        },
        overrides
      ) as unknown as GetServerSidePropsContext;

    it('Should return a back button href', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.backButtonHref).toStrictEqual(
        '/build-application/testApplicationId/testSectionId/testQuestionId/preview'
      );
    });

    it('Should return a form action', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.formAction).toStrictEqual(
        process.env.SUB_PATH +
          '/build-application/testApplicationId/testSectionId/edit/question-content'
      );
    });

    it('Should return a page caption of the section title', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.pageCaption).toStrictEqual('Custom section name');
    });

    it('Should redirect to the service error page when fetching the question data fails', async () => {
      (getQuestion as jest.Mock).mockRejectedValue({});

      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });

    it('Should redirect to the service error page when fetching the section title fails', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
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

    describe('when handling a GET request', () => {
      it('Should NOT attempt to patch the question', async () => {
        await getServerSideProps(getContext());
        expect(patchQuestion).not.toHaveBeenCalled();
      });

      it('Should return an empty array of field errors', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.fieldErrors).toStrictEqual([]);
      });

      it('Should return correct field title using the data retrieved from question entry', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.fieldTitle).toStrictEqual(
          'Test Section Field Title'
        );
      });

      it('Should return correct hint text using the data retrieved from question entry', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.hintText).toStrictEqual('Test hint text');
      });

      it('Should return correct value for optional state question using the data retrieved from question entry', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.optional).toStrictEqual('false');
      });
    });

    describe('when handling a POST request', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          fieldTitle: 'Title',
          hintText: 'A hint describing the question',
          optional: 'true',
        });
        (patchQuestion as jest.Mock).mockResolvedValue({});
      });

      const getPostContext = (overrides = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should redirect to the error service page when patching the question fails', async () => {
        (patchQuestion as jest.Mock).mockRejectedValue({});

        const value = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual(expectedRedirectObject);
      });

      it('Should redirect to application builder dashboard when question is NOT multiple option type and patching the question succeeds', async () => {
        const value = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual({
          redirect: {
            destination: '/build-application/testApplicationId/dashboard',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to question-options page when question type is "Dropdown" and patching the question succeeds', async () => {
        (getQuestion as jest.Mock).mockResolvedValue({
          fieldTitle: 'Test Section Field Title',
          hintText: 'Test hint text',
          validation: { mandatory: 'true' },
          responseType: 'Dropdown',
        });

        const value = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual({
          redirect: {
            destination:
              '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-options',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to question-options page when question type is "Dropdown" and patching the question succeeds', async () => {
        (getQuestion as jest.Mock).mockResolvedValue({
          fieldTitle: 'Test Section Field Title',
          hintText: 'Test hint text',
          validation: { mandatory: 'true' },
          responseType: 'MultipleSelection',
        });

        const value = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(value).toStrictEqual({
          redirect: {
            destination:
              '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-options',
            statusCode: 302,
          },
        });
      });

      describe('Throws validation errors', () => {
        const validationErrors = [
          {
            fieldName: 'fieldTitle',
            errorMessage: 'Question title should be greater than 2 characters',
          },
          {
            fieldName: 'hintText',
            errorMessage:
              'Question hint should not be greater than 1000 characters',
          },
        ] as ValidationError[];

        beforeEach(() => {
          (patchQuestion as jest.Mock).mockRejectedValue({
            response: {
              data: { fieldErrors: validationErrors },
            },
          });
        });

        it('Should return a list of field errors when patching a question', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldErrors).toStrictEqual(validationErrors);
        });

        it('Should return a default value of the previously entered field title when patching a question', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.fieldTitle).toStrictEqual('Title');
        });

        it('Should return a default value of the previously entered hint text when patching a question', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.hintText).toStrictEqual(
            'A hint describing the question'
          );
        });

        it('Should return a default value of the previously entered optional field when patching a question', async () => {
          const result = (await getServerSideProps(
            getPostContext({})
          )) as NextGetServerSidePropsResponse;

          expect(result.props.optional).toStrictEqual('true');
        });
      });
    });
  });
});
