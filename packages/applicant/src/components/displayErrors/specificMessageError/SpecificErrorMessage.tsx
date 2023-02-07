interface ReturnProps {
  field: string;
  error: string;
}

type SpecificErrorMessageProps = {
  errors: ReturnProps[];
  errorType: string;
};

/**
 * Generic component to be used when adding a GDS error summary to one of our pages.
 * The summary will contain all error messages with a link to the appropriate fields.
 *
 * @param {Array} errors
 * @returns GDS error summary component
 */
const SpecificErrorMessage = ({
  errors,
  errorType,
}: SpecificErrorMessageProps) => {
  const errorMessagesAvailable = errors.some(
    (error) => error.field === errorType
  )
    ? true
    : false;
  return (
    errorMessagesAvailable && (
      <>
        <span className="govuk-visually-hidden">Error</span>
        <p
          className="govuk-error-message"
          data-testid="specific-error-message"
          data-cy="cyManageNotificationsInputValidationErrorDetails"
        >
          {errors.find((error) => error.field === errorType).error}
        </p>
      </>
    )
  );
};

export default SpecificErrorMessage;
