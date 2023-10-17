import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import {
  Optional,
  getContext,
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import InferProps from '../../types/InferProps';
import MandatoryQuestionsBeforeYouStart, {
  getServerSideProps,
} from './start.page';

const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
  query: { schemeId: '1' },
});

describe('Mandatory Questions Start', () => {
  describe('getServerSideProps', () => {
    it('should return the scheme Id query param ', async () => {
      const response = await getServerSideProps(getContext(getDefaultContext));
      expect(response).toEqual({
        props: {
          schemeId: '1',
        },
      });
    });
  });

  describe('UI', () => {
    it('should display the page', () => {
      const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
        schemeId: '1',
      });
      renderWithRouter(
        <MandatoryQuestionsBeforeYouStart {...getPageProps(getDefaultProps)} />
      );

      screen.getByRole('heading', {
        name: /Before you start/i,
      });
      screen.getByRole(
        (role, element) =>
          role === 'listitem' &&
          element.textContent === 'your organisation’s address'
      );
      screen.getByRole(
        (role, element) =>
          role === 'listitem' &&
          element.textContent ===
            'your Companies House number (if you have one)'
      );
      screen.getByRole(
        (role, element) =>
          role === 'listitem' &&
          element.textContent ===
            'your Charity Commission number (if you have one)'
      );
      const continueButton = screen.getByRole('button', {
        name: /continue/i,
      });
      expect(continueButton).toHaveAttribute(
        'href',
        '/api/create-mandatory-question?schemeId=1'
      );
    });
  });
});
