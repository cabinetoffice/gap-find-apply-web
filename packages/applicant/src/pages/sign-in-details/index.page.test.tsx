import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../testUtils/createMockRouter';
import SignInDetails from './index.page';

describe('Sign in details page', () => {
  beforeEach(() => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ pathname: '/sign-in-details' })}
      >
        <SignInDetails />
      </RouterContext.Provider>
    );
  });
  it('should render heading', () => {
    screen.getByRole('heading', {
      name: /Your sign in details/i,
    });
  });

  it('should render first paragraph', () => {
    screen.getByText(
      /You use your GOV\.UK One Login to sign in to Find a grant\./i
    );
  });
  it('should render second paragraph', () => {
    screen.getByText(
      /You can change these details in your GOV\.UK One Login:/i
    );
  });

  it('should render OneLogin link', () => {
    expect(
      screen.getByRole('link', {
        name: /Change your sign in details in your GOV\.UK One Login/i,
      })
    ).toHaveAttribute(
      'href',
      `https://home.integration.account.gov.uk/security`
    );
  });
});
