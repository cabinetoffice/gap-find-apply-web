import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../../testUtils/createMockRouter';
import Header from './Header';
import { useAuth } from '../../pages/_app.page';

describe('Header Component', () => {
  describe('should render header', () => {
    beforeEach(() => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ pathname: '/header' })}
        >
          <Header isUserLoggedIn={true} />
        </RouterContext.Provider>
      );
    });
    it('should render Skip To Main Content Link', () => {
      const skipLink = screen.getByRole('link', {
        name: /skip to main content/i,
      });
      expect(skipLink).toBeDefined();
    });
    it('should render Sign Out Link', () => {
      const signOutLink = screen.getByRole('link', {
        name: /sign out/i,
      });
      expect(signOutLink).toHaveAttribute('href', '/api/logout');
    });
    it('should render Beta block', () => {
      screen.getByText(/beta/i);
      expect(
        screen.getByRole('link', {
          name: /feedback/i,
        })
      ).toHaveAttribute(
        'href',
        'https://docs.google.com/forms/d/e/1FAIpQLSeZnNVCqmtnzfZQJSBW_k9CklS2Y_ym2GRt-z0-1wf9pDEgPw/viewform'
      );
    });
  });
  it('should render the header component with Sign In if isUserLoggedIn props is false', () => {
    process.env.LOGIN_URL =
      'http://localhost:8082/login?redirectUrl=http://localhost:3000/apply/applicant/isAdmin';
    render(
      <RouterContext.Provider value={createMockRouter({})}>
        <Header isUserLoggedIn={false} />
      </RouterContext.Provider>
    );
    const signInLink = screen.getByRole('link', {
      name: /sign in/i,
    });
    expect(signInLink).toHaveAttribute(
      'href',
      process.env.NEXT_PUBLIC_LOGIN_URL
    );
  });
});

jest.mock('../../pages/_app.page');
const mockUseAuth = jest.mocked(useAuth);

describe('Testing SuperAdmin Dashboard link', () => {
  it('It should render SuperAdmin Dashboard link', () => {
    mockUseAuth.mockReturnValue({
      oneLoginEnabledInFind: true,
      isUserLoggedIn: true,
      isSuperAdmin: true,
    });
    render(
      <RouterContext.Provider value={createMockRouter({ pathname: '/header' })}>
        <Header isUserLoggedIn={true} oneLoginEnabledInFind="true" />
      </RouterContext.Provider>
    );
    expect(
      screen.getByRole('link', { name: 'Superadmin Dashboard' })
    ).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: 'Superadmin Dashboard' })
    ).toBeDefined();
  });
  it('It should NOT render SuperAdmin Dashboard link', () => {
    mockUseAuth.mockReturnValue({
      oneLoginEnabledInFind: true,
      isUserLoggedIn: true,
      isSuperAdmin: false,
    });
    render(
      <RouterContext.Provider value={createMockRouter({ pathname: '/header' })}>
        <Header isUserLoggedIn={true} oneLoginEnabledInFind="true" />
      </RouterContext.Provider>
    );
    expect(screen.queryByText('Superdmin Dashboard')).toBeNull();
  });
});
