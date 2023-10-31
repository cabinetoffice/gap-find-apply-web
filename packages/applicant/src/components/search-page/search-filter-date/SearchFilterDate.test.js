import { render, screen } from '@testing-library/react';
import { SearchFilterDate } from './SearchFilterDate';

const component = <SearchFilterDate index={1} />;
const errorComponent = (
  <SearchFilterDate
    index={1}
    filterObj={{ errors: [{ field: 'datepicker', error: 'Test' }] }}
  />
);

describe('render date range filter', () => {
  it('should render date range within an accordion section', () => {
    render(component);
    const accordion = screen.getByTestId('date-range-accordion-section');
    expect(accordion).toBeDefined();
    expect(accordion).toHaveClass('govuk-accordion__section--expanded');

    expect(screen.getByRole('heading', { name: 'Date added' })).toBeDefined();

    const fromHint = screen.getByText('From');
    expect(fromHint).toBeDefined();
    expect(fromHint).toHaveClass('govuk-hint');

    expect(screen.getByTestId('from-day')).toBeDefined();
    expect(screen.getByTestId('from-month')).toBeDefined();
    expect(screen.getByTestId('from-year')).toBeDefined();

    const toHint = screen.getByText('To');
    expect(toHint).toBeDefined();
    expect(toHint).toHaveClass('govuk-hint');

    expect(screen.getByTestId('to-day')).toBeDefined();
    expect(screen.getByTestId('to-month')).toBeDefined();
    expect(screen.getByTestId('to-year')).toBeDefined();

    const clearButton = screen.getByRole('button', { name: 'Clear date' });
    expect(clearButton).toBeDefined();
    expect(clearButton).toHaveAttribute('data-module', 'govuk-button');
    expect(clearButton).toHaveAttribute('name', 'clearDateFilters');
    expect(clearButton).toHaveAttribute('value', 'true');
  });

  it('should display an error when invalid dates are given - section content', () => {
    render(errorComponent);
    const errorMessage = screen.getByText('Test');
    expect(errorMessage).toBeDefined();
    expect(errorMessage.getAttribute('class')).toBe('govuk-error-message');
    const sectionContent = screen.getByTestId('section-content');
    expect(sectionContent).toBeDefined();
    expect(sectionContent).toHaveClass('govuk-form-group--error');
    const span = screen.getByText('Error');
    expect(span).toBeDefined();
    expect(span.getAttribute('class')).toBe('govuk-visually-hidden');
  });
});
