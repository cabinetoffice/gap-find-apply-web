import React from 'react';

/**
 * Generic component to be used when adding a GDS important notification banner.
 */
const ImportantBanner = ({
  bannerHeading,
  bannerContent,
  isSuccess = false,
}: ImportantBannerProps) => {
  return (
    <div
      className={`govuk-notification-banner ${
        isSuccess ? 'govuk-notification-banner--success' : ''
      }`}
      role={isSuccess ? 'alert' : 'region'}
      aria-labelledby="govuk-notification-banner-title"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2
          className="govuk-notification-banner__title"
          id="govuk-notification-banner-title"
          data-cy="cyImportantBannerTitle"
        >
          {isSuccess ? 'Success' : 'Important'}
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p
          className="govuk-notification-banner__heading"
          data-cy="cyImportantBannerBody"
        >
          {bannerHeading}
        </p>

        {bannerContent &&
          (typeof bannerContent === 'string' ? (
            <p className="govuk-body">{bannerContent}</p>
          ) : (
            bannerContent
          ))}
      </div>
    </div>
  );
};

export type ImportantBannerProps = {
  bannerHeading: string;
  bannerContent?: JSX.Element | string;
  isSuccess?: boolean;
};

export default ImportantBanner;
