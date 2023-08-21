import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Navigation from './Navigation';

describe('Navigation', () => {
  it('renders navigation items correctly when TECHNICAL_SUPPORT role is present in the roles', () => {
    const { getByRole } = render(<Navigation />);

    expect(getByRole('link', { name: 'Home' })).toBeVisible();
    expect(getByRole('link', { name: 'Manage users' })).toBeVisible();
    expect(getByRole('link', { name: 'Admin dashboard' })).toBeVisible();
    expect(getByRole('link', { name: 'Applicant dashboard' })).toBeVisible();
    expect(getByRole('link', { name: 'Manage API Keys' })).toBeVisible();
  });
});
