import React from 'react';
import { ValidationError } from '../../types/ValidationErrorType';
/**
 * Generic component to be used to add an error message to a specific input field.
 */
const ErrorMessage = ({ fieldErrors, fieldName }: ErrorMessageProps) => {
  const errorObject = fieldErrors.find((error) =>
    error.fieldName.startsWith(fieldName)
  );

  return (
    <>
      {!!errorObject && (
        <p
          id={`${fieldName}-error`}
          className="govuk-error-message"
          data-cy={`cy-${fieldName}-input-validation-error-details`}
          data-testid="error-message-test-id"
        >
          <span className="govuk-visually-hidden">Error: </span>
          {errorObject.errorMessage}
        </p>
      )}
    </>
  );
};

export interface ErrorMessageProps {
  fieldErrors: ValidationError[];
  fieldName: string;
}

export default ErrorMessage;
