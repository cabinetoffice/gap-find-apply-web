import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../testUtils/createMockRouter';
import GrantIsClosedPage from './grant-is-closed.page';

describe('Grant is closed page', () => {
  beforeEach(() => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ pathname: '/grant-is-closed' })}
      >
        <GrantIsClosedPage />
      </RouterContext.Provider>
    );
  });
  it('should render heading', () => {
    screen.getByRole('heading', {
      name: /this grant is closed/i,
    });
  });
  it('should render paragraph', () => {
    screen.getByText(
      /the closing date for applications has passed\. you cannot create or submit an application for this grant\./i
    );
  });

  it('should render find a grant button', () => {
    expect(
      screen.getByRole('button', {
        name: /find a grant/i,
      })
    ).toHaveAttribute(
      'href',
      'https://www.find-government-grants.service.gov.uk/grants'
    );
  });
});
