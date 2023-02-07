import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Button, ButtonTypePropertyEnum } from './Button';

const component = <Button name="Save" />;
describe('Button component', () => {
  test('should display button text', () => {
    render(component);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('should display button that is not a secondary button', () => {
    render(component);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDefined();
    expect(button).not.toHaveAttribute(
      'class',
      'govuk-button govuk-button--secondary'
    );
  });

  test('should display secondary button', () => {
    render(<Button name="Save" isSecondary={true} />);

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toBeDefined();
    expect(button).toHaveAttribute(
      'class',
      'govuk-button govuk-button--secondary'
    );
  });

  test('should have type when passed', () => {
    render(<Button name="Save" type={ButtonTypePropertyEnum.Submit} />);
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button.getAttribute('type')).toBe('submit');
  });
});
