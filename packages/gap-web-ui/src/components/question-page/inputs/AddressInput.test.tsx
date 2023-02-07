import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ValidationError } from '../../../types';
import AddressInput, { AddressInputProps } from './AddressInput';

const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'org-address-address-line-1',
    errorMessage: 'You must enter an answer',
  },
];
const defaultAddressValues = {
  addressLine1: 'First Line',
  addressLine2: 'Second Line',
  town: 'Edinburgh',
  county: 'Lothian',
  postcode: 'EH22 2TH',
};
const props: AddressInputProps = {
  questionTitle: "Enter your organisation's address",
  fieldName: 'org-address',
  questionHintText: 'Enter the address of your organisation.',
  fieldErrors: noValidationErrors,
};
const propsWithErrors: AddressInputProps = {
  ...props,
  fieldErrors: validationErrors,
};
const component = <AddressInput {...props} />;
const componentWithErrors = <AddressInput {...propsWithErrors} />;

describe('Address input component', () => {
  it('Should render page title', () => {
    render(component);
    expect(
      screen.getByRole('heading', {
        name: /enter your organisation's address/i,
      })
    );
  });

  it('Renders the title in correct size when titleSize parameter is provided', () => {
    render(<AddressInput {...props} titleSize="m" />);
    expect(screen.getByTestId('title-legend')).toHaveClass(
      'govuk-fieldset__legend--m'
    );
  });

  it('Should render hint text', () => {
    render(component);
    expect(screen.getByText(/Enter the address of your organisation\./i));
  });

  it('Does NOT render hint text when no hint text is provided', () => {
    render(component);
    expect(
      screen.queryByText(
        'A description of the page and the question what it is asking'
      )
    ).toBeFalsy();
  });

  it('Should render input headings', () => {
    render(component);
    expect(screen.getByText(/address line 1/i)).toBeDefined();
    expect(screen.getByText(/address line 2 \(optional\)/i)).toBeDefined();
    expect(screen.getByText(/town or city/i)).toBeDefined();
    expect(screen.getByText(/county \(optional\)/i)).toBeDefined();
    expect(screen.getByText(/postcode/i)).toBeDefined();
  });

  it('should render default values', () => {
    render(
      <AddressInput {...props} defaultAddressValues={defaultAddressValues} />
    );
    expect(
      screen.getByRole('textbox', {
        name: 'Address line 1',
      })
    ).toHaveProperty('defaultValue', 'First Line');

    expect(
      screen.getByRole('textbox', {
        name: 'Address line 2 (optional)',
      })
    ).toHaveProperty('defaultValue', 'Second Line');

    expect(
      screen.getByRole('textbox', {
        name: 'Town or City',
      })
    ).toHaveProperty('defaultValue', 'Edinburgh');

    expect(
      screen.getByRole('textbox', {
        name: 'County (optional)',
      })
    ).toHaveProperty('defaultValue', 'Lothian');

    expect(
      screen.getByRole('textbox', {
        name: 'Postcode',
      })
    ).toHaveProperty('defaultValue', 'EH22 2TH');
  });

  it('should not render default values if none are given', () => {
    render(component);
    expect(
      screen.getByRole('textbox', {
        name: 'Address line 1',
      })
    ).toHaveProperty('defaultValue', '');

    expect(
      screen.getByRole('textbox', {
        name: 'Address line 2 (optional)',
      })
    ).toHaveProperty('defaultValue', '');

    expect(
      screen.getByRole('textbox', {
        name: 'Town or City',
      })
    ).toHaveProperty('defaultValue', '');

    expect(
      screen.getByRole('textbox', {
        name: 'County (optional)',
      })
    ).toHaveProperty('defaultValue', '');

    expect(
      screen.getByRole('textbox', {
        name: 'Postcode',
      })
    ).toHaveProperty('defaultValue', '');
  });
});

describe('Checkbox component errors', () => {
  it('Should render error message', () => {
    render(componentWithErrors);
    expect(screen.getByText(/you must enter an answer/i));
  });

  it('Should NOT render a field error when no error is provided', () => {
    render(component);
    expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
  });
});
