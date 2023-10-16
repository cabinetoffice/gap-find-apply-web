import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import InferProps from '../../types/InferProps';
import MandatoryQuestionsBeforeYouStart, {
  getServerSideProps,
} from './start.page';

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  schemeId: '1',
});

describe('Mandatory Questions Start', () => {
  test('should render page', () => {
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
        element.textContent === 'your Companies House number (if you have one)'
    );
    screen.getByRole(
      (role, element) =>
        role === 'listitem' &&
        element.textContent ===
          'your Charity Commission number (if you have one)'
    );
    screen.getByRole('button', {
      name: /Continue/i,
    });
  });
});
