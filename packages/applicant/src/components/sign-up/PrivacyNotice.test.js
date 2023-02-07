import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PrivacyNotice from './PrivacyNotice';

describe('Rendering Privacy Notice', () => {
  it('Should display privacy notice field', () => {
    render(<PrivacyNotice errors={[]} checked={false} />);

    const checkbox = screen.getByTestId('notification_privacy');
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBeFalsy();

    const linkToNotice = screen.getByRole('link', { name: 'privacy notice' });
    expect(linkToNotice).toBeDefined();
    expect(linkToNotice).toHaveAttribute('href', '/info/privacy');
    expect(linkToNotice).toHaveAttribute('target', '_blank');
  });

  it('Should have error information if errors are present', () => {
    render(
      <PrivacyNotice
        errors={[
          { field: 'notification_privacy', error: 'This is a test error.' },
        ]}
        checked={true}
      />
    );
    const error = screen.getByTestId('specific-error-message');
    expect(error).toBeDefined();
    expect(error).toHaveClass('govuk-error-message');
    expect(error).toHaveTextContent('This is a test error.');
  });

  it('Should use checked state for checkbox', () => {
    render(<PrivacyNotice errors={[]} checked={true} />);
    const checkbox = screen.getByTestId('notification_privacy');
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBeTruthy();
  });
});
