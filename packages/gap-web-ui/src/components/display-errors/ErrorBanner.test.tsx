import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBanner from './ErrorBanner';
import React from 'react';

const multipleErrors = [
  {
    fieldName: 'test_field',
    errorMessage: 'This is a test error.',
  },
  {
    fieldName: 'test_checkbox',
    errorMessage: 'This is a test error with a fake checkbox',
  },
];

describe('Error Banner Component', () => {
  it('Should NOT render error banner when there are no errors', () => {
    render(<ErrorBanner fieldErrors={[]} />);
    expect(screen.queryByRole('alert')).toBeFalsy();
  });

  it('Should render error banner when errors are present', () => {
    render(<ErrorBanner fieldErrors={multipleErrors} />);
    const errorSummaryElement = screen.getByRole('alert');
    expect(errorSummaryElement).toHaveClass('govuk-error-summary');
  });

  it('Should render error banner heading when errors are present', () => {
    render(<ErrorBanner fieldErrors={multipleErrors} />);
    const errorSummaryHeadingElement = screen.getByRole('heading', {
      name: 'There is a problem',
    });
    expect(errorSummaryHeadingElement).toHaveClass(
      'govuk-error-summary__title'
    );
  });

  it('Should render all error message links in the banner when there are errors are present', () => {
    render(<ErrorBanner fieldErrors={multipleErrors} />);
    const errorMessage1 = screen.getByRole('link', {
      name: 'This is a test error.',
    });
    expect(errorMessage1).toHaveAttribute('href', '#test_field');
    const errorMessage2 = screen.getByRole('link', {
      name: 'This is a test error with a fake checkbox',
    });
    expect(errorMessage2).toHaveAttribute('href', '#test_checkbox');
  });
});
