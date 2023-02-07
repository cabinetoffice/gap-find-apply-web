type PreviewDetailsHeaderProps = {
  grantName: string;
  grantShortDescription: string;
  grantApplicationOpenDate: string;
  grantApplicationCloseDate: string;
};

export const PreviewDetailsHeader = ({
  grantName,
  grantShortDescription,
  grantApplicationOpenDate,
  grantApplicationCloseDate,
}: PreviewDetailsHeaderProps) => {
  return (
    <div
      className="govuk-grid-column-three-quarters"
      data-testid="advert-preview-details-header-div"
    >
      <span className="govuk-caption-l" data-cy="cy-preview-page-caption">
        How your advert looks to applicants
      </span>

      <h1 className="govuk-heading-l" data-cy="cy-preview-page-header">
        Advert details page
      </h1>

      <div data-cy="cy-preview-page-inset-text" className="govuk-inset-text">
        <p>This is what applicants will see if they select your advert.</p>
        <p>
          The preview below shows all the information you have entered so far.
        </p>
      </div>

      <h2
        className="govuk-heading-m"
        data-cy="cy-grant-detail-name"
        tabIndex={-1}
      >
        {grantName}
      </h2>

      <p className="govuk-body" data-cy="cy-grant-short-description">
        {grantShortDescription}
      </p>

      <ul className="govuk-list">
        <li>
          <strong data-cy="cy-grant-open-date-key">{'Opening date'}:</strong>{' '}
          <span data-cy="cy-grant-open-date-value">
            {grantApplicationOpenDate}
          </span>
        </li>
        <li>
          <strong data-cy="cy-grant-close-date-key">{'Closing date'}:</strong>{' '}
          <span data-cy="cy-grant-close-date-value">
            {grantApplicationCloseDate}
          </span>
        </li>
      </ul>
    </div>
  );
};
