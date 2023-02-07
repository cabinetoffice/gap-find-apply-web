interface ErrorsInterface {
  length: number;
  error: string;
  field: string;
}

type ErrorBannerProps = {
  errors: ErrorsInterface[];
};

/**
 * Generic component to be used when adding a GDS error summary to one of our pages.
 * The summary will contain all error messages with a link to the appropriate fields.
 *
 * @param {Array} errors
 * @returns GDS error summary component
 */
const ErrorBanner = ({ errors }: ErrorBannerProps) => {
  return (
    <>
      {errors.length > 0 && (
        <div
          className="govuk-error-summary"
          aria-labelledby="error-summary-title"
          role="alert"
          data-module="govuk-error-summary"
          data-cy="cyErrorBanner"
        >
          <h2
            className="govuk-error-summary__title"
            id="error-summary-title"
            data-cy="cyErrorBannerHeading"
          >
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
              {errors.map((error) => (
                <li key={error.field}>
                  <a
                    href={`#${error.field}`}
                    aria-label={error.error}
                    data-cy={`cyError_${error.field}`}
                  >
                    {error.error}
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

export default ErrorBanner;
