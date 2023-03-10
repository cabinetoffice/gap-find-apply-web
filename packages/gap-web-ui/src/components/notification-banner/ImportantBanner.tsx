import React from 'react';

/**
 * Generic component to be used when adding a GDS important notification banner.
 * Currently we provide bannerContent prop for single line notifications,
 * if this component needs to use more than a single line,
 *  it is recommended to restructure it to use a h3 and a p tag
 */
const ImportantBanner = ({ bannerContent }: ImportantBannerProps) => {
  return (
    <div
      className="govuk-notification-banner"
      role="region"
      aria-labelledby="govuk-notification-banner-title"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2
          className="govuk-notification-banner__title"
          id="govuk-notification-banner-title"
          data-cy="cyImportantBannerTitle"
        >
          Important
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p
          className="govuk-notification-banner__heading"
          data-cy="cyImportantBannerBody"
        >
          {bannerContent}
        </p>
      </div>
    </div>
  );
};

export interface ImportantBannerProps {
  bannerContent: string;
}

export default ImportantBanner;
