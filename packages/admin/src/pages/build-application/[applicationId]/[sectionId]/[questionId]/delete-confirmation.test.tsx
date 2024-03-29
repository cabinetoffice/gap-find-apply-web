import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import DeleteQuestion, { getServerSideProps } from './delete-confirmation.page';
import { deleteQuestion } from '../../../../../services/QuestionService';
import { parseBody } from '../../../../../utils/parseBody';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../services/QuestionService');

const APPLICATION_ID = 'testApplicationId';
const SECTION_ID = 'testSectionId';
const QUESTION_ID = 'testQuestionId';

const customProps = {
  fieldErrors: [],
  backButtonHref: '/dashboard',
  formAction: '',
  defaultValue: '',
  csrfToken: '',
  deleteConfirmationUrl: 'some-url',
  previewPageUrl: 'some-url',
};

const expectedRedirectObject = {
  redirect: {
    destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to delete a question","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
    statusCode: 302,
  } as Redirect,
};

const component = <DeleteQuestion {...customProps} />;

const getContext = (overrides = {}) =>
  merge(
    {
      query: {
        backTo: 'dashboard',
        version: '1',
      },
      params: {
        applicationId: APPLICATION_ID,
        sectionId: SECTION_ID,
        questionId: QUESTION_ID,
      } as Record<string, string>,
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
      },
      res: { getHeader: () => 'testCSRFToken' },
      resolvedUrl:
        '/build-application/testApplicationId/testSectionId/testQuestionId/delete-confirmation',
    } as unknown as GetServerSidePropsContext,
    overrides
  );

describe('Delete question page', () => {
  describe('UI', () => {
    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <DeleteQuestion
          {...customProps}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );

      expect(document.title).toBe('Error: Delete a question - Manage a grant');
    });

    it('Renders page layout', () => {
      render(component);
      screen.getByTestId('question-page-form');
      screen.getByTestId('radioFormDiv');
      screen.getByRole('button', { name: 'Confirm' });
      screen.getByRole('link', { name: 'Cancel' });
      expect(document.title).toBe('Delete a question - Manage a grant');
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/dashboard'
      );
    });
  });

  describe('Handling a GET request', () => {
    it('Should NOT attempt to delete a question', async () => {
      await getServerSideProps(getContext());
      expect(deleteQuestion).not.toHaveBeenCalled();
    });

    it('Should return an empty array of field errors', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.fieldErrors).toStrictEqual([]);
    });

    it('Should return a correct form action', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.formAction).toStrictEqual(
        process.env.SUB_PATH +
          `/build-application/${APPLICATION_ID}/${SECTION_ID}/${QUESTION_ID}/delete-confirmation`
      );
    });

    it('Should return a correct backButtonHref', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.backButtonHref).toStrictEqual(
        `/build-application/${APPLICATION_ID}/dashboard`
      );
    });
  });

  describe('Handling a POST request', () => {
    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({
        deleteBool: 'true',
      });
      process.env.SESSION_COOKIE_NAME = 'gap-test';
    });

    const getPostContext = (overrides: any = {}) =>
      getContext(merge({ req: { method: 'POST' } }, overrides));

    it('Should redirect to the error service page when deleting a question fails', async () => {
      (deleteQuestion as jest.Mock).mockRejectedValue({});

      const value = (await getServerSideProps(
        getPostContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });

    it('Should redirect to the dashboard when deleting a question succeeds', async () => {
      (deleteQuestion as jest.Mock).mockResolvedValue({});

      const value = (await getServerSideProps(
        getPostContext()
      )) as NextGetServerSidePropsResponse;

      expect(deleteQuestion).toHaveBeenCalledWith(
        'testSessionId',
        'testApplicationId',
        'testSectionId',
        'testQuestionId',
        '1'
      );
      expect(value).toStrictEqual({
        redirect: {
          destination: `/build-application/${APPLICATION_ID}/dashboard`,
          statusCode: 302,
        },
      });
    });

    it('Should not try to delete the question and redirect to the dashboard when confirmation page submits a "No"/false value', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        deleteBool: 'false',
      });

      const value = (await getServerSideProps(
        getPostContext()
      )) as NextGetServerSidePropsResponse;

      expect(deleteQuestion).not.toHaveBeenCalled();
      expect(value).toStrictEqual({
        redirect: {
          destination: `/build-application/${APPLICATION_ID}/dashboard`,
          statusCode: 302,
        },
      });
    });

    it('should redirect to the edit section page.', async () => {
      (parseBody as jest.Mock).mockResolvedValue({
        deleteBool: 'false',
      });
      const value = (await getServerSideProps(
        getPostContext({ query: { backTo: 'edit-section' } })
      )) as NextGetServerSidePropsResponse;

      expect(deleteQuestion).not.toHaveBeenCalled();
      expect(value).toStrictEqual({
        redirect: {
          destination: `/build-application/${APPLICATION_ID}/${SECTION_ID}`,
          statusCode: 302,
        },
      });
    });
  });
});
