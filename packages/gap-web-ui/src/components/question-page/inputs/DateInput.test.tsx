import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DateInput, { DateInputProps } from './DateInput';

const props: DateInputProps = {
  questionTitle: 'Title',
  questionHintText:
    'A description of the page and the question what it is asking',
  fieldErrors: [],
  fieldName: 'date',
};

const component = <DateInput {...props} />;

describe('DateInput component', () => {
  describe('DateInput no-errors scenarios', () => {
    test('should display Title', () => {
      render(<DateInput {...props} />);

      screen.getByRole('heading', {
        name: /title/i,
      });
    });

    test('Renders the title in correct size when titleSize parameter is provided', () => {
      render(<DateInput {...props} titleSize="m" />);
      expect(screen.getByTestId('title-legend')).toHaveClass(
        'govuk-fieldset__legend--m'
      );
    });

    test('Renders a page description when a description is provided', () => {
      render(component);
      expect(screen.getByTestId('date-hint').textContent).toBe(
        'A description of the page and the question what it is asking\n\nFor example, 31 3 2023'
      );
    });

    test('Should render example text as page description when a description is not provided', () => {
      const { questionHintText: _, ...noDescProps } = props;
      render(<DateInput {...noDescProps} />);
      expect(screen.getByTestId('date-hint').textContent).toBe(
        'For example, 31 3 2023'
      );
    });

    test('should have fieldName in div', () => {
      render(<DateInput {...props} />);

      const dateDiv = screen.getByTestId('dateGroupDiv');

      expect(dateDiv.getAttribute('id')).toBe('date');
    });

    test('should display day, month and year input boxes empty when no defaultValues are passed', () => {
      render(<DateInput {...props} />);

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });
      expect(screen.getAllByRole('textbox')).toHaveLength(3);
      expect(day).toHaveValue('');
      expect(month).toHaveValue('');
      expect(year).toHaveValue('');
    });

    test('should have defaultValues if have been passed', () => {
      render(
        <DateInput
          {...props}
          defaultValues={{ day: '15', month: '12', year: '1515' }}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).toHaveValue('15');
      expect(month).toHaveValue('12');
      expect(year).toHaveValue('1515');
    });

    test('should display Description if passed', () => {
      render(<DateInput {...props} questionHintText={'test description'} />);

      screen.getByText(/test description/i);
    });

    test('should not display Error if fieldError is empty', () => {
      render(<DateInput {...props} />);

      const dateGroupDiv = screen.getByTestId('dateGroupDiv');
      expect(dateGroupDiv).toHaveClass('govuk-form-group');
    });
  });

  describe('DateInput errors scenarios', () => {
    test('should display Error if fieldError is not empty', () => {
      const propsWithError: DateInputProps = {
        ...props,
        fieldErrors: [{ fieldName: 'date-day', errorMessage: 'Error Message' }],
      };
      render(<DateInput {...propsWithError} />);

      const dateGroupDiv = screen.getByTestId('dateGroupDiv');

      screen.getByText(/error message/i);
      screen.getByTestId(`error-message-test-id`);
      expect(dateGroupDiv).toHaveClass('govuk-form-group--error');
    });

    test('day input should have a red border when day is mentioned in the  errorMessage', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            { fieldName: 'date-day', errorMessage: 'Error Message day' },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).toHaveClass('govuk-input--error');
      expect(month).not.toHaveClass('govuk-input--error');
      expect(year).not.toHaveClass('govuk-input--error');
    });

    test('month input should have a red border when month is mentioned in the  errorMessage', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            { fieldName: 'date-month', errorMessage: 'Error Message month' },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).not.toHaveClass('govuk-input--error');
      expect(month).toHaveClass('govuk-input--error');
      expect(year).not.toHaveClass('govuk-input--error');
    });

    test('year input should have a red border when year is mentioned in the  errorMessage', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            { fieldName: 'date-year', errorMessage: 'Error Message year' },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).not.toHaveClass('govuk-input--error');
      expect(month).not.toHaveClass('govuk-input--error');
      expect(year).toHaveClass('govuk-input--error');
    });
    test('year and month input should have a red border when year and month are mentioned in the  errorMessage', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            {
              fieldName: 'date-year',
              errorMessage: 'Error Message Year MoNtH',
            },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).not.toHaveClass('govuk-input--error');
      expect(month).toHaveClass('govuk-input--error');
      expect(year).toHaveClass('govuk-input--error');
    });

    test('year and day input should have a red border when year and day are mentioned in the  errorMessage', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            {
              fieldName: 'date-year',
              errorMessage: 'Error Message Year DaY',
            },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).toHaveClass('govuk-input--error');
      expect(month).not.toHaveClass('govuk-input--error');
      expect(year).toHaveClass('govuk-input--error');
    });

    test('day and month input should have a red border when day and month are mentioned in the  errorMessage', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            {
              fieldName: 'date-year',
              errorMessage: 'Error Message DaY MoNtH',
            },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).toHaveClass('govuk-input--error');
      expect(month).toHaveClass('govuk-input--error');
      expect(year).not.toHaveClass('govuk-input--error');
    });

    test('year, day and month input should have a red border when error fieldName is fieldName-date', () => {
      render(
        <DateInput
          {...props}
          fieldErrors={[
            {
              fieldName: 'date-day',
              errorMessage: 'You must enter a date',
            },
          ]}
        />
      );

      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).toHaveClass('govuk-input--error');
      expect(month).toHaveClass('govuk-input--error');
      expect(year).toHaveClass('govuk-input--error');
    });

    test('Should default to NOT disabled', () => {
      render(<DateInput {...props} />);
      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).not.toHaveAttribute('disabled');
      expect(month).not.toHaveAttribute('disabled');
      expect(year).not.toHaveAttribute('disabled');
    });

    test('Should be disabled when the disabled prop is true', () => {
      render(<DateInput {...props} disabled />);
      const day = screen.getByRole('textbox', {
        name: /day/i,
      });
      const month = screen.getByRole('textbox', {
        name: /month/i,
      });
      const year = screen.getByRole('textbox', {
        name: /year/i,
      });

      expect(day).toHaveAttribute('disabled');
      expect(month).toHaveAttribute('disabled');
      expect(year).toHaveAttribute('disabled');
    });
  });
});
