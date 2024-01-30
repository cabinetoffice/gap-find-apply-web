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
    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Delete a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <DeleteQuestion
          {...customProps}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );

      expect(document.title).toBe('Error: Delete a question - Manage a grant');
    });

    it('Should render a back button with correct link on it', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/dashboard'
      );
    });

    it('Renders page layout', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Renders radio input to confirm whether to delete question or not', () => {
      render(component);
      screen.getByTestId('radioFormDiv');
    });

    it('Renders "Confirm" button', () => {
      render(component);
      screen.getByRole('button', { name: 'Confirm' });
    });

    it('Renders "Cancel" link', () => {
      render(component);
      screen.getByRole('link', { name: 'Cancel' });
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

      expect(deleteQuestion).toHaveBeenCalled();
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
  });
});
