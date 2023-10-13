import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MandatoryQuestionsBeforeYouStart, {
  MandatoryQuestionsProps,
} from './start.page';
import { getProps } from 'gap-web-ui';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../testUtils/createMockRouter';

function getDefaultProps(): MandatoryQuestionsProps {
  return {
    schemeId: '1',
  };
}

describe('Mandatory Questions Start', () => {
  test('should render page', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/applications`,
        })}
      >
        <MandatoryQuestionsBeforeYouStart {...getProps(getDefaultProps)} />
      </RouterContext.Provider>
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
