type DownloadMessageProps = {
  count: number;
};

const DownloadMessage = ({ count }: DownloadMessageProps) => {
  return (
    <div
      className="govuk-notification-banner"
      role="region"
      aria-labelledby="govuk-notification-banner-title"
      data-module="govuk-notification-banner"
      data-testid="spotlight-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2
          className="govuk-notification-banner__title"
          id="govuk-notification-banner-title"
        >
          Important
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-notification-banner__heading">
          Cannot download {count} {count > 1 ? 'applications' : 'application'}
        </p>
        <p className="govuk-body">
          You can view a read-only copy of the applications that are affected in
          the &quot;Applications unavailable for download&quot; section of this
          page.
        </p>
      </div>
    </div>
  );
};

export { DownloadMessage };
