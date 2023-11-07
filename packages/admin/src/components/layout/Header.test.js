import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from './Header';
import { useRouter } from 'next/router';

jest.mock('./navigation', () => ({
  MobileNavigationBar: () => <p>MobileNavigationBar</p>,
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Testing Header component', () => {
  beforeEach(() =>
    useRouter.mockReturnValue({ pathname: 'some-other-dashboard' })
  );
  it('Renders a sign out button', () => {
    render(<Header />);
    screen.getByRole('link', { name: 'Sign out' });
  });

  it('should not render the mobile navigation bar if super admin dashboard', () => {
    useRouter.mockReturnValue({ pathname: '/super-admin-dashboard' });
    render(<Header isUserLoggedIn={true} />);
    expect(screen.queryByText('MobileNavigationBar')).toBeNull();
  });

  it('should render the mobile navigation bar', () => {
    render(<Header isUserLoggedIn={true} />);
    expect(screen.getByText('MobileNavigationBar')).toBeVisible();
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
