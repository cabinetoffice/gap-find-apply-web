import { render, screen } from '@testing-library/react';
import { NewGrantsButton } from './NewGrantsButton';

const mockParams = {
  from: {
    day: '9',
    month: '5',
    year: '2022',
  },
  to: {
    day: '16',
    month: '5',
    year: '2022',
  },
};

describe('Render the new grants button', () => {
  it('Should render form with correct hidden properties', () => {
    render(<NewGrantsButton dateParams={mockParams} />);

    const form = screen.getByTestId('grants-form');
    expect(form).toBeDefined();
    expect(form).toHaveAttribute('method', 'GET');
    expect(form).toHaveAttribute('action', '/grants');
    expect(screen.getByTestId('from-day')).toBeDefined();
    expect(screen.getByTestId('from-month')).toBeDefined();
    expect(screen.getByTestId('from-year')).toBeDefined();
    expect(screen.getByTestId('to-day')).toBeDefined();
    expect(screen.getByTestId('to-month')).toBeDefined();
    expect(screen.getByTestId('to-year')).toBeDefined();
  });

  it('Should render the new grants button', () => {
    render(<NewGrantsButton dateParams={mockParams} />);

    const button = screen.getByRole('button', { name: 'View Updates' });
    expect(button).toBeDefined();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('data-module', 'govuk-button');
    expect(button).toHaveClass('govuk-button--secondary');
  });

  it('Should populate hidden inputs with correct values', () => {
    render(<NewGrantsButton dateParams={mockParams} />);

    expect(screen.getByTestId('from-day')).toHaveValue('9');
    expect(screen.getByTestId('from-month')).toHaveValue('5');
    expect(screen.getByTestId('from-year')).toHaveValue('2022');
    expect(screen.getByTestId('to-day')).toHaveValue('16');
    expect(screen.getByTestId('to-month')).toHaveValue('5');
    expect(screen.getByTestId('to-year')).toHaveValue('2022');
  });
});
