import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { DateField } from './DateField';

const component = (
  <DateField
    fieldName="test"
    header="Test Date Field"
    hint="Enter test date"
    values={{ day: 9, month: 5, year: 2022 }}
  />
);

describe('Should render the GDS date field', () => {
  it('should have correct fields', () => {
    render(component);

    expect(
      screen.getByRole('heading', { name: 'Test Date Field' })
    ).toBeDefined();
    expect(screen.getByText('Enter test date')).toBeDefined();

    const day = screen.getByLabelText('Day');
    expect(day).toBeDefined();
    expect(day).toHaveValue('9');

    const month = screen.getByLabelText('Month');
    expect(month).toBeDefined();
    expect(month).toHaveValue('5');

    const year = screen.getByLabelText('Year');
    expect(year).toBeDefined();
    expect(year).toHaveValue('2022');
  });

  it('should style elements according to GDS', () => {
    render(component);
    const heading = screen.getByRole('heading', { name: 'Test Date Field' });
    expect(heading).toHaveClass('govuk-fieldset__heading');
    expect(heading.closest('legend')).toHaveClass(
      'govuk-fieldset__legend govuk-fieldset__legend--l'
    );

    const hint = screen.getByText('Enter test date');
    expect(hint).toHaveClass('govuk-hint');

    const day = screen.getByLabelText('Day');
    const month = screen.getByLabelText('Month');
    const year = screen.getByLabelText('Year');
    const fields = [day, month, year];

    fields.forEach((field) => {
      expect(field).toHaveClass('govuk-input govuk-date-input__input');
      expect(field.previousSibling).toHaveClass(
        'govuk-label govuk-date-input__label'
      );
      const formGroup = field.closest('div');
      expect(formGroup).toHaveClass('govuk-form-group');
      expect(formGroup.closest('#test-date-range-fields > div')).toHaveClass(
        'govuk-date-input__item'
      );
    });
  });

  it('shouldnt render hint or header if none provided', () => {
    render(<DateField fieldName="test" />);

    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByTestId('hint')).toBeNull();
  });
});
