import { render, screen } from '@testing-library/react';
import { ConfirmationMessage } from './ConfirmationMessage';

describe('confirmation message component', () => {
  it('should display the success message when a message is passed in', () => {
    render(
      <ConfirmationMessage
        title="This is a test title"
        message={'This is a test'}
      />
    );
    expect(screen.getByText('Success')).toBeDefined();
    expect(screen.getByText('This is a test title')).toBeDefined();
    expect(screen.getByText('This is a test')).toBeDefined();
  });
});
