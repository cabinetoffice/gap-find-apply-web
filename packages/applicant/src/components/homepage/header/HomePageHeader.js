export function HomePageHeader({ heading }) {
  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full govuk-!-margin-top-3">
          <h1
            className="govuk-heading-xl govuk-!-margin-bottom-4"
            data-cy="cyHomePageTitle"
            id="main-content-focus"
            tabIndex={-1}
          >
            {heading}
          </h1>
        </div>
      </div>
    </>
  );
}
