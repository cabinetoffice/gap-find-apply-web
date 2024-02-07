import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import PreviewQuestion, { getServerSideProps } from './preview.page';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import { GetServerSidePropsContext } from 'next';
import NextGetServerSidePropsResponse from '../../../../../../types/NextGetServerSidePropsResponse';

jest.mock('../../../../../../services/ApplicationService');

const sampleQuestion = {
  questionId: 'testQuestionId',
  fieldTitle: 'Test field title',
  hintText: 'Test description of a question',
  responseType: 'ShortAnswer',
  validation: { mandatory: true },
};

describe('PreviewQuestion', () => {
  describe('PreviewQuestion component', () => {
    const getProps = (overrides: any = {}) =>
      merge(
        {
          question: sampleQuestion,
          changeHref:
            '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content',
          backHref: '/testHref',
          applicationFormStatus: 'DRAFT',
        },
        overrides
      );

    describe('Edit view', () => {
      beforeEach(() => {
        render(<PreviewQuestion {...getProps()} />);
      });

      it('Should render a meta title', () => {
        expect(document.title).toBe('Preview a question - Manage a grant');
      });

      it('Should render a preview page caption', () => {
        screen.getByText('Question preview');
      });

      it('Should render the response of PreviewInputSwitch', () => {
        screen.getByRole('textbox');
      });

      it('Should render a "Exit preview" button', () => {
        expect(
          screen.getByRole('button', { name: 'Exit preview' })
        ).toHaveAttribute(
          'href',
          '/apply/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content'
        );
      });
    });
  });

  describe('getServerSideProps', () => {
    beforeEach(() => {
      (getApplicationFormSummary as jest.Mock).mockResolvedValue({
        applicationName: 'Test App Name',
        applicationStatus: 'DRAFT',
        sections: [
          {
            sectionId: 'testSectionId',
            questions: [sampleQuestion],
          },
        ],
      });
      process.env.SESSION_COOKIE_NAME = 'gap-test';
    });

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
            cookies: { 'gap-test': 'testSessionId' },
          } as any,
        } as GetServerSidePropsContext,
        overrides
      );

    it('Should fetch the relevant question', async () => {
      await getServerSideProps(getContext());

      expect(getApplicationFormSummary).toHaveBeenCalledTimes(1);
      expect(getApplicationFormSummary).toHaveBeenCalledWith(
        'testApplicationId',
        'testSessionId'
      );
    });

    it('Should return a redirect to the error service page when fetching the application form fails', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to preview this question.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should return a redirect to the error service page when fetching the question fails', async () => {
      const response = (await getServerSideProps(
        getContext({ params: { questionId: 'WRONG' } })
      )) as NextGetServerSidePropsResponse;

      expect(response).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Could not find the question, please make sure the URL is correct","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should return the relevant props', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response).toStrictEqual({
        props: {
          question: sampleQuestion,
          backHref: '/build-application/testApplicationId/dashboard',
          changeHref:
            '/build-application/testApplicationId/testSectionId/testQuestionId/edit/question-content',
          applicationFormStatus: 'DRAFT',
        },
      });
    });
  });
});
