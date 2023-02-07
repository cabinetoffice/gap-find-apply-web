import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from './Header';

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
