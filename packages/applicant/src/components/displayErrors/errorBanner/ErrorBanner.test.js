import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBanner from './ErrorBanner';

const multipleErrors = [
  {
    field: 'test_field',
    error: 'This is a test error.',
  },
  {
    field: 'test_checkbox',
    error: 'This is a test error with a fake checkbox',
  },
];

describe('Rendering Error Banner', () => {
  it('Should have no content if there are no errors', () => {
    render(<ErrorBanner errors={[]} />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'There is a problem' })
    ).toBeNull();
  });

  it('Should display error information if errors are present', () => {
    render(<ErrorBanner errors={multipleErrors} />);
    const header = screen.getByRole('heading', { name: 'There is a problem' });
    const mainDiv = screen.getByRole('alert');
    expect(header).toBeDefined();
    expect(header).toHaveClass('govuk-error-summary__title');
    expect(mainDiv).toBeDefined();
    expect(mainDiv).toHaveClass('govuk-error-summary');

    const error = screen.getByText('This is a test error.');
    expect(error).toBeDefined();
    expect(error).toHaveAttribute('href', '#test_field');
  });

  it('Should contain multiple errors if multiple errors are present', () => {
    render(<ErrorBanner errors={multipleErrors} />);
    expect(
      screen.getByRole('heading', { name: 'There is a problem' })
    ).toBeDefined();
    expect(screen.getAllByRole('listitem').length).toBe(multipleErrors.length);
  });
});
