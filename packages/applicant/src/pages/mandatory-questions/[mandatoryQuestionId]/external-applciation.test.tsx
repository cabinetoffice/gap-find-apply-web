import { screen } from '@testing-library/react';
import { Optional, getContext } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import ExternalApplicationSignpost, {
  getServerSideProps,
} from './external-application.page';

const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
  query: { url: 'exampleUrl' },
  params: { mandatoryQuestionId: '1' },
});

describe('External application', () => {
  describe('getServerSideProps', () => {
    it('should return the external url and mandatory question ID query params ', async () => {
      const response = await getServerSideProps(getContext(getDefaultContext));
      expect(response).toEqual({
        props: {
          url: 'exampleUrl',
          mandatoryQuestionId: '1',
        },
      });
    });
  });

  describe('UI', () => {
    it('should display the page', () => {
      const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
        url: 'exampleUrl',
        mandatoryQuestionId: '1',
      });

      renderWithRouter(
        <ExternalApplicationSignpost {...getPageProps(getDefaultProps)} />
      );

      expect(screen.getByRole('link', { name: 'Back' })).toHaveProperty(
        'href',
        'http://localhost/mandatory-questions/1/organisation-summary'
      );
      screen.getByRole('heading', {
        name: /You are now leaving GOV.UK/i,
      });
      screen.getByText(
        /thank you for providing us with information on your grant application\. we will use this information to help us understand the demand for this grant\./i
      );
      screen.getByText(
        /the application form for this grant is not managed by gov\.uk\. when you continue, you will be directed to another website\. you may need to log in or sign up to this website to continue your application\./i
      );
      const continueButton = screen.getByRole('button', {
        name: /Continue to application form/i,
      });
      expect(continueButton).toHaveAttribute('href', '/exampleUrl');
    });
  });
});
