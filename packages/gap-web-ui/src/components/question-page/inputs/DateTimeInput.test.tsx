import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SelectInputComponentProps } from './SelectInput';
import DateTimeInput from './DateTimeInput';

const customProps: SelectInputComponentProps = {
  fieldName: 'fieldNameOpen',
  fieldErrors: [],
};

const component = <DateTimeInput {...customProps} />;

describe('DateTimeInput component', () => {
  it('Should render the SelectInput component', () => {
    render(component);

    screen.getByTestId('select-input-component');
  });

  it('Should render default time input options if no overriding options are provided', () => {
    render(component);
    const times = [
      { label: '12:01am', value: '00:01' },
      { label: '1am', value: '01:00' },
      { label: '2am', value: '02:00' },
      { label: '3am', value: '03:00' },
      { label: '4am', value: '04:00' },
      { label: '5am', value: '05:00' },
      { label: '6am', value: '06:00' },
      { label: '7am', value: '07:00' },
      { label: '8am', value: '08:00' },
      { label: '9am', value: '09:00' },
      { label: '10am', value: '10:00' },
      { label: '11am', value: '11:00' },
      { label: '12pm', value: '12:00' },
      { label: '1pm', value: '13:00' },
      { label: '2pm', value: '14:00' },
      { label: '3pm', value: '15:00' },
      { label: '4pm', value: '16:00' },
      { label: '5pm', value: '17:00' },
      { label: '6pm', value: '18:00' },
      { label: '7pm', value: '19:00' },
      { label: '8pm', value: '20:00' },
      { label: '9pm', value: '21:00' },
      { label: '10pm', value: '22:00' },
      { label: '11pm', value: '23:00' },
      { label: '11:59pm', value: '23:59' },
    ];

    times.forEach((time) => {
      expect(screen.getByRole('option', { name: time.label })).toHaveValue(
        time.value
      );
    });
  });

  it('Should render a small question title', () => {
    render(<DateTimeInput {...customProps} questionTitle="Closing date" />);

    screen.getByRole('combobox', { name: 'Closing time' });
  });

  it('Should have an id & name of the passed in fieldName, followed by -time', () => {
    render(<DateTimeInput {...customProps} />);

    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('id', 'fieldNameOpen-time');
    expect(combobox).toHaveAttribute('name', 'fieldNameOpen-time');
  });

  it('Should select the default as the passed in timeDefaultValue', () => {
    render(
      <DateTimeInput {...customProps} timeDefaultValues={'Select an option'} />
    );

    expect(screen.getByRole('combobox')).toHaveValue('Select an option');
  });

  it('Should select a default of "Select an opening time" when the fieldName contains "Open"', () => {
    render(<DateTimeInput {...customProps} />);

    expect(screen.getByRole('combobox')).toHaveValue('Select an opening time');
  });

  it('Should select a default of "Select a closing time" when the fieldName contains "Close"', () => {
    render(<DateTimeInput {...customProps} fieldName="fieldNameClose" />);

    expect(screen.getByRole('combobox')).toHaveValue('Select a closing time');
  });

  it('Should select NO default value when the fieldName contains neither "Close" OR "Open"', () => {
    render(<DateTimeInput {...customProps} fieldName="fieldName" />);

    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('Should render the hint text ONCE', () => {
    render(<DateTimeInput {...customProps} questionHintText="A description" />);

    expect(screen.getByTestId('fieldNameOpen-hint').textContent).toBe(
      'A description\n\nFor example, 31 3 2023'
    );
  });

  it('Should filter out fieldErrors that relate to the time component rather than the date component', () => {
    render(
      <DateTimeInput
        {...customProps}
        fieldName="test"
        fieldErrors={[
          { fieldName: 'test-time', errorMessage: 'Test Error Message' },
        ]}
      />
    );

    const dateGroupDiv = screen.getByTestId('dateGroupDiv');
    expect(dateGroupDiv).not.toHaveClass('govuk-form-group--error');
  });
});
