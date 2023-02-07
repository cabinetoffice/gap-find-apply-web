import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Button, { ButtonProps, ButtonTypePropertyEnum } from './Button';

let props: ButtonProps = { text: 'Save and continue' };
const component = <Button {...props} />;
describe('Button component', () => {
  test('should display button text', () => {
    render(component);

    screen.getByRole('button', { name: 'Save and continue' });
  });

  test('should display button that is not a secondary button', () => {
    render(component);

    const button = screen.getByRole('button', { name: 'Save and continue' });

    expect(button).toHaveClass('govuk-button');
    expect(button).not.toHaveClass('govuk-button--secondary');
  });

  test('should display secondary button', () => {
    props = { ...props, isSecondary: true };
    render(<Button {...props} />);

    const button = screen.getByRole('button', { name: 'Save and continue' });

    expect(button).toHaveClass('govuk-button--secondary');
  });

  test('should have type when passed', () => {
    props = { ...props, type: ButtonTypePropertyEnum.Submit };
    render(<Button {...props} />);

    const button = screen.getByRole('button', { name: 'Save and continue' });

    expect(button.getAttribute('type')).toBe('submit');
  });

  test('should have the name attribute when addNameAttribute is true', () => {
    props = { ...props, addNameAttribute: true };
    render(<Button {...props} />);

    const button = screen.getByRole('button', { name: 'Save and continue' });
    expect(button).toHaveAttribute('name', 'save-and-continue');
  });

  test('should NOT have the name attribute when addNameAttribute is false', () => {
    props = { ...props, addNameAttribute: false };
    render(<Button {...props} />);

    const button = screen.getByRole('button', { name: 'Save and continue' });
    expect(button).not.toHaveAttribute('name', 'save-and-continue');
  });

  test('should set correct data-cy value', () => {
    render(component);
    expect(
      screen.getByRole('button', { name: 'Save and continue' })
    ).toHaveAttribute('data-cy', 'cy-button-Save and continue');
  });
});
