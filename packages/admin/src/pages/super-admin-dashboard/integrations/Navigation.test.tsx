import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Navigation from './Navigation';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: 'test',
    query: {},
    push: jest.fn(),
  }),
}));

describe('Navigation', () => {
  it('renders navigation items correctly when TECHNICAL_SUPPORT role is present in the roles', () => {
    const screen = render(<Navigation />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Manage users' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Admin dashboard' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Applicant dashboard' })
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Manage API keys' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Integrations' })).toBeVisible();
  });
});
