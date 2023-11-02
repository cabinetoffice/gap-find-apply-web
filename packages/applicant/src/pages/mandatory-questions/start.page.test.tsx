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
    });
  });
});
