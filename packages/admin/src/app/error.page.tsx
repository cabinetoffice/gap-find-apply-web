'use client'; // Error components must be Client Components

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sorry, there is a problem with the service – Find a Grant – GOV.UK',
};

export default function Error() {
  return (
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-l">
          Sorry, there is a problem with the service
        </h1>

        <p className="govuk-body">Try again later.</p>

        <p className="govuk-body">
          If the issue persists, contact our support team at{' '}
          <a
            href="mailto:findagrant@cabinetoffice.gov.uk"
            className="govuk-link"
          >
            findagrant@cabinetoffice.gov.uk
          </a>
          {'.'}
        </p>
      </div>
    </div>
  );
}
