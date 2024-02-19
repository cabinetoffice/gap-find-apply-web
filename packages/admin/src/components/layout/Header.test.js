import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from './Header';
import { useAdminAuth } from '../../pages/_app.page';

jest.mock('../../pages/_app.page');

const mockUseAdminAuth = jest.mocked(useAdminAuth);

describe('Testing Header component', () => {
  it('Renders a sign out button', () => {
    render(<Header />);
    screen.getByRole('link', { name: 'Sign out' });
  });

  it('should render Beta block', () => {
    render(<Header />);
    screen.getByText(/beta/i);
    expect(
      screen.getByRole('link', {
        name: /feedback/i,
      })
    ).toHaveAttribute(
      'href',
      'https://docs.google.com/forms/d/e/1FAIpQLSd2V0IqOMpb2_yQnz_Ges0WCYFnDOTxZpF299gePV1j8kMdLA/viewform'
    );
  });
});

describe('Testing SuperAdmin Dashboard link', () => {
  it('It should render SuperAdmin Dashboard link', () => {
    mockUseAdminAuth.mockReturnValue({ isSuperAdmin: true });
    render(<Header />);
    expect(screen.getByText('Superadmin Dashboard')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Superadmin Dashboard' })
    ).toHaveAttribute('href', '/apply/admin/super-admin-dashboard');
  });
  it('It should NOT render SuperAdmin Dashboard link', () => {
    mockUseAdminAuth.mockReturnValue({ isSuperAdmin: false });
    render(<Header />);
    expect(screen.queryByText('Superdmin Dashboard')).toBeNull();
  });
});
