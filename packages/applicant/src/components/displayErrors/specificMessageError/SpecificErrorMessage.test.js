import { render, screen } from '@testing-library/react';
import SpecificErrorMessage from './SpecificErrorMessage';

const component = (
  <SpecificErrorMessage
    errorType={'test'}
    errors={[{ field: 'test', error: 'test' }]}
  />
);

describe('Specific Error Message Component', () => {
  it('should render the fixed error span for the component', () => {
    render(component);
    const span = screen.getByText('Error');
    expect(span).toBeDefined();
    expect(span.getAttribute('class')).toBe('govuk-visually-hidden');
  });

  it('should render the error message passed into the component', () => {
    render(component);
    const message = screen.getByText('test');
    expect(message).toBeDefined();
    expect(message.getAttribute('class')).toBe('govuk-error-message');
    expect(message.getAttribute('data-cy')).toBe(
      'cyManageNotificationsInputValidationErrorDetails'
    );
  });

  it('should not render the error banner or the error message', () => {
    render(<SpecificErrorMessage errors={[]} errorType={'test error'} />);
    expect(screen.queryByText('Error')).toBeNull();
    expect(screen.queryByTestId('user-email-error')).toBeNull();
  });
});
