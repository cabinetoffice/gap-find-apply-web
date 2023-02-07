import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Login from './index.page';

describe('Manage a grant login page', () => {
  beforeEach(() => {
    render(<Login />);
  });

  it('should render page heading and description', () => {
    screen.getByRole('heading', {
      name: /manage a grant/i,
    });
    screen.getByText(
      /use this service to build an application form and see who has applied for your grant\./i
    );
    screen.getByText(/if you have an account, you can sign in\./i);
  });

  it('should render sign in button', () => {
    expect(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    ).toHaveAttribute(
      'href',
      'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login'
    );
  });
});
