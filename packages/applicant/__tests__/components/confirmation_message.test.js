import { render, screen } from '@testing-library/react';
import { ConfirmationMessage } from '../../src/components/confirmation-message/ConfirmationMessage';

describe('confirmation message component', () => {
  it('should display the success message when a message is passed in', () => {
    render(<ConfirmationMessage message={'This is a test'} />);
    expect(screen.getByText('This is a test')).toBeDefined();
    expect(screen.getByText('Success')).toBeDefined();
  });

  it('should display the success message when no message is passed in', () => {
    render(<ConfirmationMessage />);
    expect(screen.getByText('Success')).toBeDefined();
  });
});
