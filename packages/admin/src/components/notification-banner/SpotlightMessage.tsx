import CustomLink from '../custom-link/CustomLink';

type SpotlightMessageProps = {
  status: string;
  count: number;
  schemeUrl: string;
};

const spotlightErrorTitles: { [key: string]: string } = {
  API: "We can't send your data to Spotlight",
  GGIS: 'Spotlight did not recognise your GGIS number',
  VALIDATION: 'Automatic uploads are not running',
};

const spotlightErrorMessages: { [key: string]: string } = {
  API: 'Some of your data cannot be automatically sent to Spotlight.\nThis affects {count} of your records. You can still download this data to manually upload it to Spotlight.',
  GGIS: "Spotlight did not recognise the GGIS reference number for your grant. Your data is still secure, and we'll try to send your data to Spotlight again tonight.",
  VALIDATION:
    "Due to a service outage, we cannot automatically send data to Spotlight at the moment.\nThis affects {count} of your records. We'll try to send those records again tonight. You can still download your data and upload it to Spotlight manually.",
};

const SpotlightMessage = ({
  status,
  count,
  schemeUrl,
}: SpotlightMessageProps) => {
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
          {spotlightErrorTitles[status]}
        </p>
        <p className="govuk-body">
          {status == 'GGIS' ? (
            <p className="govuk-body">
              Spotlight did not recognise the GGIS reference number for your
              grant.{' '}
              <CustomLink href={schemeUrl}>
                Check that your grant reference number is correct.
              </CustomLink>{' '}
              Your data is still secure, and we&apos;ll try to send your data to
              Spotlight again tonight.
            </p>
          ) : (
            spotlightErrorMessages[status].replace('{count}', count.toString())
          )}
        </p>
        <p className="govuk-body">
          If you need further support, contact our support team at{' '}
          <a
            className="govuk-notification-banner__link"
            href="mailto:findagrant@cabinetoffice.gov.uk"
          >
            findagrant@cabinetoffice.gov.uk
          </a>
        </p>
      </div>
    </div>
  );
};

export { SpotlightMessage };
