import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ValidationError } from '../../types';
import ErrorMessage, { ErrorMessageProps } from './ErrorMessage';

const fieldError: ValidationError = {
  fieldName: 'exampleFieldNameExample',
  errorMessage: 'exampleFieldName is required.',
};
const fieldName = 'exampleFieldName';
const props: ErrorMessageProps = { fieldName, fieldErrors: [fieldError] };

describe('Error Message Component', () => {
  it('Should render an error message when the start of the fieldError-fieldName match the fieldName', () => {
    render(<ErrorMessage {...props} />);
    expect(screen.getByText('Error:')).toHaveClass('govuk-visually-hidden');
    expect(screen.getByText('exampleFieldName is required.')).toHaveClass(
      'govuk-error-message'
    );
  });
  it('Should render an error message when the fieldError-fieldName match the fieldName', () => {
    render(
      <ErrorMessage {...props} fieldErrors={[{ ...fieldError, fieldName }]} />
    );
    expect(screen.getByText('Error:')).toHaveClass('govuk-visually-hidden');
    expect(screen.getByText('exampleFieldName is required.')).toHaveClass(
      'govuk-error-message'
    );
  });

  it('Should NOT render anything when there is no error matching the field', () => {
    render(<ErrorMessage {...props} fieldErrors={[]} />);
    expect(screen.queryByText('Error:')).toBeFalsy();
    expect(screen.queryByText('exampleFieldName is required.')).toBeFalsy();
  });

  it('Should NOT render anything when the start of the fieldError-fieldName does not match the fieldName', () => {
    render(<ErrorMessage {...props} fieldName="wrong" />);
    expect(screen.queryByText('Error:')).toBeFalsy();
    expect(screen.queryByText('exampleFieldName is required.')).toBeFalsy();
  });
});
