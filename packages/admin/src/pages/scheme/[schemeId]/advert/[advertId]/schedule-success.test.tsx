import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ScheduleSuccessPage, {
  getServerSideProps,
} from './schedule-success.page';
import { GetServerSidePropsContext } from 'next';
import {
  getContext,
  Optional,
  getPageProps,
  expectObjectEquals,
} from '../../../../../testUtils/unitTestHelpers';
import InferProps from '../../../../../types/InferProps';

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  backToAccountLink: `/scheme/schemeId`,
});

describe('Advert - Schedule Success Page', () => {
  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'schemeId',
        advertId: 'advertId',
      },
    });

    it('Should return the link to advert as a prop when slug is provided', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));
      expectObjectEquals(result, {
        props: { backToAccountLink: '/scheme/schemeId' },
      });
    });
  });

  describe('Schedule Success Page', () => {
    beforeEach(() => {
      render(<ScheduleSuccessPage {...getPageProps(getDefaultProps)} />);
    });

    it("Should render 'Back to my account' button", () => {
      expect(
        screen.getByRole('button', { name: 'Back to my account' })
      ).toHaveAttribute('href', '/apply/scheme/schemeId');
    });
  });
});
