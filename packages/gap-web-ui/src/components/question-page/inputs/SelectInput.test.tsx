import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SelectInput, { SelectInputComponentProps } from './SelectInput';

const propsWithoutOptionValues: SelectInputComponentProps = {
  questionTitle: 'Page title',
  questionHintText: 'A hint text for the question',
  fieldName: 'fieldName',
  fieldErrors: [],
  selectOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
};

const propsWithOptionValues: SelectInputComponentProps = {
  ...propsWithoutOptionValues,
  defaultValue: 'Pick an option',
};

const propsWithDefaultOptionValuesInOptions: SelectInputComponentProps = {
  ...propsWithoutOptionValues,
  defaultValue: 'Option A',
};

const propsWithObjectOptionsAndDefaultValue: SelectInputComponentProps = {
  ...propsWithoutOptionValues,
  selectOptions: [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B' },
    { label: 'Option C', value: 'C' },
    { label: 'Option D', value: 'D' },
  ],
  defaultValue: 'A',
};

const component = <SelectInput {...propsWithOptionValues} />;
const componentWithoutDefaultValue = (
  <SelectInput {...propsWithoutOptionValues} />
);

const componentWithOptionValuesInOptions = (
  <SelectInput {...propsWithDefaultOptionValuesInOptions} />
);

describe('Additional information for the Select input component', () => {
  it('Renders the provided page title', () => {
    render(component);
    screen.getByRole('heading', { name: 'Page title' });
  });

  it('Renders the title in correct size when titleSize parameter is provided', () => {
    render(<SelectInput {...propsWithOptionValues} titleSize="m" />);
    expect(screen.getByText('Page title')).toHaveClass('govuk-label--m');
  });

  it('Renders a page description when a description is provided', () => {
    render(component);
    screen.getByText('A hint text for the question');
  });

  it('Does NOT render hint text when hint text is not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { questionHintText, ...noDescProps } = propsWithOptionValues;
    render(<SelectInput {...noDescProps} />);
    expect(screen.queryByText('A hint text for the question')).toBeFalsy();
  });
});

describe('Select input', () => {
  it('Renders the select input', () => {
    render(component);
    screen.getByRole('combobox', { name: 'Page title' });
  });

  it('Should NOT be disabled by default', () => {
    render(component);
    expect(
      screen.getByRole('combobox', { name: 'Page title' })
    ).not.toHaveAttribute('disabled');
  });

  it('Should be disabled when disabled prop is set to true', () => {
    render(<SelectInput {...propsWithOptionValues} disabled />);
    expect(
      screen.getByRole('combobox', { name: 'Page title' })
    ).toHaveAttribute('disabled');
  });

  it('Option should be created and "selected" if no default value is provided', () => {
    render(componentWithoutDefaultValue);
    const selectOption = screen.getByRole('option', { name: '' });

    expect(selectOption).toHaveProperty('selected', true);
  });

  it('Correct option should be "selected" if default value is provided', () => {
    render(component);
    const selectOption = screen.getByRole('option', { name: 'Pick an option' });

    expect(selectOption).toHaveProperty('selected', true);
    expect(selectOption).not.toHaveAttribute('value');
  });

  it('Correct option should be "selected" if default value matches one of the select options', () => {
    render(componentWithOptionValuesInOptions);
    const selectOption = screen.getByRole('option', { name: 'Option A' });

    expect(selectOption).toHaveProperty('selected', true);
    expect(selectOption).toHaveAttribute('value', 'Option A');
  });

  it('Correct option should be "selected" if default value matches one of the select options', () => {
    render(<SelectInput {...propsWithObjectOptionsAndDefaultValue} />);
    const selectOption = screen.getByRole('option', { name: 'Option A' });

    expect(selectOption).toHaveProperty('selected', true);
    expect(selectOption).toHaveValue('A');
  });

  it('All the options should be rendered if default value is given', () => {
    render(component);
    expect(
      screen.getByRole('option', { name: 'Pick an option' })
    ).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option A' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option C' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option D' })).toBeDefined();
  });

  it('All the options should be rendered if no default value is given', () => {
    render(componentWithoutDefaultValue);
    expect(screen.getByRole('option', { name: '' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option A' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option C' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Option D' })).toBeDefined();
  });
});

describe('Error cases', () => {
  const customPropsWithError = {
    ...propsWithOptionValues,
    fieldErrors: [
      {
        fieldName: propsWithOptionValues.fieldName,
        errorMessage: 'This field is required.',
      },
    ],
  };

  it('Renders a field error when an error is provided', () => {
    render(<SelectInput {...customPropsWithError} />);
    screen.getByTestId('error-message-test-id');
  });

  it('Renders a red border to the left of the input area', () => {
    render(<SelectInput {...customPropsWithError} />);
    expect(screen.getByTestId('select-input-component')).toHaveClass(
      'govuk-form-group--error'
    );
  });

  it('Does NOT render a field error when no error is provided', () => {
    render(component);
    expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
  });
});
