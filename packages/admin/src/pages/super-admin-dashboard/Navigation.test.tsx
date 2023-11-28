import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Navigation from './Navigation';
import { useRouter } from 'next/router';

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    SUPER_ADMIN_DASHBOARD_URL: 'http://localhost:3000/super-admin-dashboard',
    FIND_A_GRANT_URL: 'http://localhost:3000/find-a-grant',
  },
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: 'test',
    query: {},
    push: jest.fn(),
  }),
}));

describe('Navigation', () => {
  it('renders navigation items correctly when TECHNICAL_SUPPORT role is present in the roles', () => {
    const { getByRole } = render(<Navigation />);

    expect(getByRole('link', { name: 'Home' })).toBeVisible();
    expect(getByRole('link', { name: 'Manage users' })).toBeVisible();
    expect(getByRole('link', { name: 'Admin dashboard' })).toBeVisible();
    expect(getByRole('link', { name: 'Applicant dashboard' })).toBeVisible();
    expect(getByRole('link', { name: 'Manage API keys' })).toBeVisible();
    expect(getByRole('link', { name: 'Integrations' })).toBeVisible();
  });
});
