import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../testUtils/createMockRouter';
import Header from './Header';

describe('Header Component', () => {
  describe('should render header', () => {
    beforeEach(() => {
      render(
        <RouterContext.Provider
          value={createMockRouter({ pathname: '/header' })}
        >
          <Header />
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
