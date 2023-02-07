import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SignupForm from './SignupForm';

const formData = {
  fields: [
    <input
      type="hidden"
      name="hiddenField"
      id="hiddenField"
      data-testid="hidden-field"
      value={true}
      key={0}
    />,
  ],
  action: '/test/signup',
  resultingAction: 'Enter your email to Signup',
};

describe('Rendering Signup Form', () => {
  it('Should render Signup form', () => {
    render(
      <SignupForm formData={formData} errors={[]} previousFormValues={{}} />
    );

    const signupForm = screen.getByTestId('signup-form');
    expect(signupForm).toBeDefined();
    expect(signupForm).toHaveAttribute('action', '/test/signup');
    expect(signupForm).toHaveAttribute('method', 'POST');

    expect(screen.getByTestId('red-banner')).toHaveClass('govuk-form-group');

    const header = screen.getByRole('heading', {
      name: 'Enter your email address',
    });
    expect(header).toBeDefined();
    expect(header).toHaveAttribute('tabIndex', '-1');
    expect(header).toHaveAttribute('id', 'main-content-focus');

    const label = screen.getByText('Enter your email to Signup');
    expect(label).toBeDefined();
  });

  it('Should render form fields', () => {
    render(
      <SignupForm formData={formData} errors={[]} previousFormValues={{}} />
    );

    expect(screen.getByTestId('notification_privacy_field')).toBeDefined();

    const emailField = screen.getByTestId('user_email');
    expect(emailField).toBeDefined();
    expect(emailField.value).toBe('');

    const submitBtn = screen.getByText('Continue');
    expect(submitBtn).toHaveClass('govuk-button');
    expect(submitBtn).toHaveAttribute('type', 'submit');
  });

  it('Should render any additional form fields', () => {
    render(
      <SignupForm formData={formData} errors={[]} previousFormValues={{}} />
    );

    const additionalFormFields = screen.getByTestId('hidden-field');
    expect(additionalFormFields).toBeDefined();
    expect(additionalFormFields).toHaveAttribute('type', 'hidden');
    expect(additionalFormFields).toHaveValue('true');
  });

  it('Should render errors for input field', () => {
    render(
      <SignupForm
        formData={formData}
        errors={[
          {
            field: 'user_email',
            error: 'This is a test error.',
          },
        ]}
        previousFormValues={{}}
      />
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByTestId('red-banner')).toHaveClass(
      'govuk-form-group govuk-form-group--error'
    );
    const emailError = screen.getByTestId('specific-error-message');
    expect(emailError).toBeDefined();
    expect(emailError).toHaveClass('govuk-error-message');
    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName.toLowerCase() === 'p' &&
          content === 'This is a test error.'
        );
      })
    ).toBeDefined();

    expect(screen.getByTestId('user_email')).toHaveClass('govuk-input--error');
  });

  it('Should use previous form values to pre-populate email fields', () => {
    render(
      <SignupForm
        formData={formData}
        errors={[]}
        previousFormValues={{ user_email: 'test@email.com' }}
      />
    );

    const emailField = screen.getByTestId('user_email');
    expect(emailField).toBeDefined();
    expect(emailField).toHaveValue('test@email.com');
  });
});
