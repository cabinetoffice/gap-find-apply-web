import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../../testUtils/createMockRouter';
import SignInDetails, { getServerSideProps } from './index.page';

process.env.ONE_LOGIN_SECURITY_URL =
  'https://home.integration.account.gov.uk/security';

describe('getServerSideProps', () => {
  it('should return page props', async () => {
    const response = await getServerSideProps(null);
    expect(response).toEqual({
      props: {
        oneLoginUrl: process.env.ONE_LOGIN_SECURITY_URL,
      },
    });
  });
});

const oneLoginUrl = process.env.ONE_LOGIN_SECURITY_URL;

describe('Sign in details page', () => {
  beforeEach(() => {
    render(
      <RouterContext.Provider
        value={createMockRouter({ pathname: '/sign-in-details' })}
      >
        <SignInDetails oneLoginUrl={oneLoginUrl} />
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
