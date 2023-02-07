export function SearchResultCounter({ countGrants, currentPage }) {
  return (
    <div className="govuk-grid-column-one-third">
      <h1
        className="govuk-heading-l govuk-!-margin-bottom-2"
        data-cy="cyGrantsPageTitle"
        id="main-content-focus"
        tabIndex={-1}
      >
        Search results
      </h1>
      {countGrants >= 0 && (
        <p
          className="govuk-!-margin-top-0"
          data-cy="cyGrantsFoundMessage"
          data-testid="grant-count"
          aria-label={`Showing page ${currentPage} of results`}
        >
          We’ve found <strong>{countGrants}</strong>
          {countGrants === 1 ? ' grant' : ' grants'}
        </p>
      )}
    </div>
  );
}
