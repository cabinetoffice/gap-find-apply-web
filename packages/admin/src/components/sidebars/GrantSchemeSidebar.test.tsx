import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import GrantSchemeSidebar from './GrantSchemeSidebar';

describe('Create Grant Scheme Sidebar', () => {
  it('Should render sidebar description text', () => {
    render(<GrantSchemeSidebar />);
    screen.getByText('Add a grant to your account.');
  });

  it('Should render a "create new grant scheme" button', () => {
    render(<GrantSchemeSidebar />);
    expect(
      screen.getByRole('button', {
        name: 'Add a grant',
      })
    ).toHaveAttribute('href', '/apply/new-scheme/name');
  });
});
