import React from 'react';
import { ValidationError } from '../../types/ValidationErrorType';

/**
 * Generic component to be used when adding a GDS error summary to one of our pages.
 * The summary will contain all error messages with a link to the appropriate fields.
 */
const ErrorBanner = ({ fieldErrors }: ErrorBannerProps) => {
  return (
    <>
      {fieldErrors.length > 0 && (
        <div
          className="govuk-error-summary"
          aria-labelledby="error-summary-title"
          role="alert"
          data-module="govuk-error-summary"
          data-cy="cyErrorBanner"
          id="error-summary"
          tabIndex={-1} // A tab index of -1 allows this element to be focusable, but cannot be tabbed to
        >
          <h2
            className="govuk-error-summary__title"
            id="error-summary-title"
            data-cy="cyErrorBannerHeading"
          >
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul
              className="govuk-list govuk-error-summary__list"
              data-cy="cyError-summary-list"
            >
              {fieldErrors.map((fieldError) => (
                <li key={fieldError.fieldName}>
                  <a
                    href={`#${fieldError.fieldName}`}
                    aria-label={fieldError.errorMessage}
                    data-cy={`cyError_${fieldError.fieldName}`}
                  >
                    {fieldError.errorMessage}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export interface ErrorBannerProps {
  fieldErrors: ValidationError[];
}

export default ErrorBanner;
