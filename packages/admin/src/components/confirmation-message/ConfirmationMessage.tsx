type ConfirmationMessageProps = {
  title: string;
  message: string;
};

const ConfirmationMessage = ({ title, message }: ConfirmationMessageProps) => {
  return (
    <div
      className="govuk-notification-banner govuk-notification-banner--success"
      role="alert"
      aria-labelledby="govuk-notification-banner-title"
      data-module="govuk-notification-banner"
      data-cy="confirmation-message-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2
          className="govuk-notification-banner__title"
          id="govuk-notification-banner-title"
        >
          Success
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <h3
          className="govuk-notification-banner__heading"
          data-cy="confirmation-message-title"
        >
          {title}
        </h3>
        <p className="govuk-body" data-cy="confirmation-message-text">
          {message}
        </p>
      </div>
    </div>
  );
};

export { ConfirmationMessage };
